$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptsRoot = Split-Path -Parent $ScriptDir
$ProjectRoot = Split-Path -Parent $ScriptsRoot
$ServerScriptPath = Join-Path $ProjectRoot "src\server\server.mjs"
$Url = "http://127.0.0.1:4782"
$DataDir = Join-Path $ProjectRoot "data"
$ServerPidPath = Join-Path $DataDir "dashboard-server.pid"
$LauncherLogPath = Join-Path $DataDir "launcher.log"
$RuntimeDir = Join-Path $ProjectRoot "runtime"
$RuntimePackagesDir = Join-Path $RuntimeDir "packages"
$NodeVersion = "24.14.0"
$Port = 4782

function Write-LauncherLog {
  param([string]$Message)
  $Stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $LauncherLogPath -Value "[$Stamp] $Message" -Encoding UTF8
}

function Get-WindowsRuntimeKey {
  $Architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString().ToLowerInvariant()
  if ($Architecture.Contains("arm64")) {
    return "win-arm64"
  }
  return "win-x64"
}

function Find-NodeExeUnder {
  param([string]$BasePath)

  if (-not (Test-Path -LiteralPath $BasePath)) {
    return $null
  }

  $DirectCandidates = @(
    (Join-Path $BasePath "node.exe"),
    (Join-Path $BasePath "node\node.exe"),
    (Join-Path $BasePath "node\bin\node.exe")
  )

  foreach ($Candidate in $DirectCandidates) {
    if (Test-Path -LiteralPath $Candidate) {
      return $Candidate
    }
  }

  $Match = Get-ChildItem -LiteralPath $BasePath -Filter node.exe -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($Match) {
    return $Match.FullName
  }

  return $null
}

function Expand-BundledNodeRuntime {
  $RuntimeKey = Get-WindowsRuntimeKey
  $ArchivePath = Join-Path $RuntimePackagesDir "node-v$NodeVersion-$RuntimeKey.zip"
  $TargetDir = Join-Path $RuntimeDir $RuntimeKey
  $ResolvedNode = Find-NodeExeUnder -BasePath $TargetDir
  if ($ResolvedNode) {
    return $ResolvedNode
  }

  if (-not (Test-Path -LiteralPath $ArchivePath)) {
    return $null
  }

  Write-LauncherLog "Extracting bundled Node runtime from $ArchivePath"
  New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
  Expand-Archive -LiteralPath $ArchivePath -DestinationPath $TargetDir -Force
  $ResolvedNode = Find-NodeExeUnder -BasePath $TargetDir
  if ($ResolvedNode) {
    return $ResolvedNode
  }

  throw "Failed to locate node.exe after extracting $ArchivePath"
}

function Resolve-NodeExe {
  $BundledNode = Expand-BundledNodeRuntime
  if ($BundledNode) {
    return $BundledNode
  }

  $Candidates = @(
    (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
  )

  foreach ($Candidate in $Candidates) {
    if ($Candidate -and (Test-Path -LiteralPath $Candidate)) {
      return $Candidate
    }
  }

  $SystemNode = Get-Command node -ErrorAction SilentlyContinue
  if ($SystemNode) {
    return $SystemNode.Source
  }

  throw "Node runtime not found. Put the official Node package in runtime/packages, or make node available on PATH."
}

function Test-ProcessAlive {
  param([string]$PidPath)

  if (-not (Test-Path -LiteralPath $PidPath)) {
    return $false
  }

  $RawPid = Get-Content -LiteralPath $PidPath -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $RawPid) {
    return $false
  }

  $Process = Get-Process -Id ([int]$RawPid) -ErrorAction SilentlyContinue
  return $null -ne $Process
}

function Test-DashboardHealth {
  try {
    $Response = Invoke-WebRequest -Uri "$Url/api/health" -UseBasicParsing -TimeoutSec 2
    $CorsReady = $Response.Headers["Access-Control-Allow-Origin"] -eq "*"
    return $Response.StatusCode -eq 200 -and $CorsReady
  } catch {
    return $false
  }
}

function Test-DashboardBuild {
  try {
    $Response = Invoke-WebRequest -Uri "$Url/app.js?ts=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -UseBasicParsing -TimeoutSec 2
    if ($Response.StatusCode -ne 200) {
      return $false
    }

    $Content = [string]$Response.Content
    $HasEditorFields = $Content.Contains('const EDITOR_FIELDS = [')
    $HasNewToggle = $Content.Contains('key: "__hasWrittenTest"')
    $HasOldHint = $Content.Contains('els.editorHint.textContent = state.editor.mode === "new"')
    $HasAppliedField = $Content.Contains('key: HEADER.appliedFlag, label:')
    $HasPresentationAppliedField = $Content.Contains('key: HEADER.presentationApplied, label:')

    if (-not ($HasEditorFields -and $HasNewToggle -and -not $HasOldHint -and -not $HasAppliedField -and -not $HasPresentationAppliedField)) {
      return $false
    }

    $DataResponse = Invoke-WebRequest -Uri "$Url/api/data" -UseBasicParsing -TimeoutSec 2
    if ($DataResponse.StatusCode -ne 200) {
      return $false
    }

    $Payload = $DataResponse.Content | ConvertFrom-Json
    return $Payload -and $Payload.meta -and $Payload.rows -ne $null
  } catch {
    return $false
  }
}

function Get-PortProcessId {
  param([int]$LocalPort)

  try {
    $Connection = Get-NetTCPConnection -LocalAddress "127.0.0.1" -LocalPort $LocalPort -State Listen -ErrorAction Stop | Select-Object -First 1
    if ($Connection) {
      return [int]$Connection.OwningProcess
    }
  } catch {
  }

  return $null
}

function Stop-PortProcess {
  param([int]$LocalPort)

  $PortPid = Get-PortProcessId -LocalPort $LocalPort
  if ($null -eq $PortPid) {
    return
  }

  try {
    Stop-Process -Id $PortPid -Force -ErrorAction Stop
    Write-LauncherLog "Stopped existing process on port $LocalPort (PID $PortPid)"
  } catch {
    Write-LauncherLog "Failed to stop process on port ${LocalPort}: $($_.Exception.Message)"
  }
}

function Start-DashboardServer {
  $StartInfo = New-Object System.Diagnostics.ProcessStartInfo
  $StartInfo.FileName = $NodeExe
  $StartInfo.Arguments = "`"$ServerScriptPath`""
  $StartInfo.WorkingDirectory = $ProjectRoot
  $StartInfo.UseShellExecute = $true
  $StartInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden

  $Process = [System.Diagnostics.Process]::Start($StartInfo)
  if (-not $Process) {
    throw "Failed to launch dashboard server process."
  }

  Set-Content -LiteralPath $ServerPidPath -Value $Process.Id -Encoding UTF8
  Write-LauncherLog "Started dashboard server with PID $($Process.Id) using $NodeExe"
}

function Open-DashboardBrowser {
  if ($env:OFFER_DASHBOARD_NO_OPEN -eq "1") {
    Write-LauncherLog "Skipping browser launch because OFFER_DASHBOARD_NO_OPEN=1"
    return
  }

  Write-LauncherLog "Opening $Url"
  Start-Process $Url
}

try {
  New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
  New-Item -ItemType Directory -Path $RuntimePackagesDir -Force | Out-Null
  Write-LauncherLog "Launcher started from $ProjectRoot"
  $NodeExe = Resolve-NodeExe
  Write-LauncherLog "Using Node runtime $NodeExe"

  if (-not (Test-ProcessAlive -PidPath $ServerPidPath) -or -not (Test-DashboardHealth) -or -not (Test-DashboardBuild)) {
    Write-LauncherLog "Restarting dashboard server on port $Port"
    Stop-PortProcess -LocalPort $Port
    Start-Sleep -Milliseconds 300
    Start-DashboardServer
  }

  $IsReady = $false
  for ($Attempt = 0; $Attempt -lt 30; $Attempt += 1) {
    if ((Test-DashboardHealth) -and (Test-DashboardBuild)) {
      $IsReady = $true
      break
    }
    Start-Sleep -Milliseconds 250
  }

  if (-not $IsReady) {
    throw "Dashboard server did not become ready within the expected time. Check $LauncherLogPath."
  }

  Open-DashboardBrowser
} catch {
  Write-LauncherLog "Launcher failed: $($_.Exception.Message)"
  Add-Type -AssemblyName System.Windows.Forms
  $Message = "Dashboard launch failed.`r`n`r`n$($_.Exception.Message)`r`n`r`nLog: $LauncherLogPath"
  [System.Windows.Forms.MessageBox]::Show($Message, "Offer Dashboard", "OK", "Error") | Out-Null
  throw
}
