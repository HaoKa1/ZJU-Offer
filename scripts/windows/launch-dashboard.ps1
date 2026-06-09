$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptsRoot = Split-Path -Parent $ScriptDir
$ProjectRoot = Split-Path -Parent $ScriptsRoot
$ServerScriptPath = Join-Path $ProjectRoot "src\server\server.mjs"
$LaunchPagePath = Join-Path $ProjectRoot "src\web\launching.html"
$Url = "http://127.0.0.1:4782"
$DataDir = Join-Path $ProjectRoot "data"
$ServerPidPath = Join-Path $DataDir "dashboard-server.pid"
$LauncherLogPath = Join-Path $DataDir "launcher.log"
$RuntimeDir = Join-Path $ProjectRoot "runtime"
$RuntimeDownloadsDir = Join-Path $RuntimeDir "downloads"
$NodeVersion = "24.14.0"
$NodeDistBaseUrl = "https://nodejs.org/dist/v$NodeVersion"
$Port = 4782

function Write-LauncherLog {
  param([string]$Message)
  $Stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $LauncherLogPath -Value "[$Stamp] $Message" -Encoding UTF8
}

function Normalize-PathForCompare {
  param([string]$PathValue)

  if (-not $PathValue) {
    return ""
  }

  try {
    return [System.IO.Path]::GetFullPath($PathValue).TrimEnd("\", "/").ToLowerInvariant()
  } catch {
    return [string]$PathValue
  }
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

function Test-NodeVersion {
  param([string]$NodePath)

  if (-not $NodePath -or -not (Test-Path -LiteralPath $NodePath)) {
    return $false
  }

  try {
    $VersionText = & $NodePath --version 2>$null
    if (-not $VersionText) {
      return $false
    }

    $Major = [int]($VersionText.TrimStart("v").Split(".")[0])
    return $Major -ge 24
  } catch {
    return $false
  }
}

function Invoke-NodeDownload {
  param(
    [string]$Url,
    [string]$DestinationPath
  )

  $TempPath = "$DestinationPath.tmp"
  if (Test-Path -LiteralPath $TempPath) {
    Remove-Item -LiteralPath $TempPath -Force -ErrorAction SilentlyContinue
  }

  Invoke-WebRequest -Uri $Url -OutFile $TempPath -UseBasicParsing
  Move-Item -LiteralPath $TempPath -Destination $DestinationPath -Force
}

function Test-NodeArchiveChecksum {
  param(
    [string]$ArchivePath,
    [string]$ArchiveName
  )

  $ChecksumPath = Join-Path $RuntimeDownloadsDir "SHASUMS256.txt"
  if (-not (Test-Path -LiteralPath $ChecksumPath)) {
    Invoke-NodeDownload -Url "$NodeDistBaseUrl/SHASUMS256.txt" -DestinationPath $ChecksumPath
  }

  $Line = Get-Content -LiteralPath $ChecksumPath | Where-Object { $_ -match "\s$([regex]::Escape($ArchiveName))$" } | Select-Object -First 1
  if (-not $Line) {
    Write-LauncherLog "Checksum entry for $ArchiveName was not found."
    return $false
  }

  $ExpectedHash = ($Line -split "\s+")[0].ToLowerInvariant()
  $ActualHash = (Get-FileHash -LiteralPath $ArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
  return $ExpectedHash -eq $ActualHash
}

function Get-CachedNodeRuntime {
  $RuntimeKey = Get-WindowsRuntimeKey
  $TargetDir = Join-Path $RuntimeDir $RuntimeKey
  $ResolvedNode = Find-NodeExeUnder -BasePath $TargetDir
  if ($ResolvedNode -and (Test-NodeVersion -NodePath $ResolvedNode)) {
    return $ResolvedNode
  }

  return $null
}

function Expand-Or-DownloadNodeRuntime {
  $RuntimeKey = Get-WindowsRuntimeKey
  $ArchiveName = "node-v$NodeVersion-$RuntimeKey.zip"
  $ArchivePath = Join-Path $RuntimeDownloadsDir $ArchiveName
  $TargetDir = Join-Path $RuntimeDir $RuntimeKey

  if (-not (Test-Path -LiteralPath $ArchivePath)) {
    $DownloadUrl = "$NodeDistBaseUrl/$ArchiveName"
    New-Item -ItemType Directory -Path $RuntimeDownloadsDir -Force | Out-Null
    Write-LauncherLog "Downloading Node runtime from $DownloadUrl"
    try {
      Invoke-NodeDownload -Url $DownloadUrl -DestinationPath $ArchivePath
    } catch {
      Write-LauncherLog "Failed to download Node runtime: $($_.Exception.Message)"
      if (Test-Path -LiteralPath $ArchivePath) {
        Remove-Item -LiteralPath $ArchivePath -Force -ErrorAction SilentlyContinue
      }
      return $null
    }
  }

  if (-not (Test-NodeArchiveChecksum -ArchivePath $ArchivePath -ArchiveName $ArchiveName)) {
    Remove-Item -LiteralPath $ArchivePath -Force -ErrorAction SilentlyContinue
    throw "Downloaded Node runtime checksum did not match $ArchiveName. Please retry."
  }

  Write-LauncherLog "Extracting Node runtime from $ArchivePath"
  if (Test-Path -LiteralPath $TargetDir) {
    Remove-Item -LiteralPath $TargetDir -Recurse -Force
  }
  New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
  Expand-Archive -LiteralPath $ArchivePath -DestinationPath $TargetDir -Force
  $ResolvedNode = Find-NodeExeUnder -BasePath $TargetDir
  if ($ResolvedNode -and (Test-NodeVersion -NodePath $ResolvedNode)) {
    return $ResolvedNode
  }

  throw "Failed to locate node.exe after extracting $ArchivePath"
}

function Resolve-NodeExe {
  $SystemNode = Get-Command node -ErrorAction SilentlyContinue
  if ($SystemNode -and (Test-NodeVersion -NodePath $SystemNode.Source)) {
    return $SystemNode.Source
  }

  $Candidates = @(
    (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
  )

  foreach ($Candidate in $Candidates) {
    if ($Candidate -and (Test-NodeVersion -NodePath $Candidate)) {
      return $Candidate
    }
  }

  $CachedNode = Get-CachedNodeRuntime
  if ($CachedNode) {
    return $CachedNode
  }

  $DownloadedNode = Expand-Or-DownloadNodeRuntime
  if ($DownloadedNode) {
    return $DownloadedNode
  }

  throw "Node runtime not found. Connect to the internet for first launch, or install Node.js 24+ and make node available on PATH."
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
    if (-not ($Response.StatusCode -eq 200 -and $CorsReady)) {
      return $false
    }

    $Payload = $Response.Content | ConvertFrom-Json
    $RemoteRoot = Normalize-PathForCompare -PathValue $Payload.projectRoot
    $LocalRoot = Normalize-PathForCompare -PathValue $ProjectRoot
    return $RemoteRoot -and $RemoteRoot -eq $LocalRoot
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
    return $null -ne $Payload -and $null -ne $Payload.meta -and $null -ne $Payload.rows
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
  $StartInfo.UseShellExecute = $false
  $StartInfo.CreateNoWindow = $true
  $StartInfo.EnvironmentVariables["OFFER_DASHBOARD_AUTO_SHUTDOWN"] = "1"

  $Process = [System.Diagnostics.Process]::Start($StartInfo)
  if (-not $Process) {
    throw "Failed to launch dashboard server process."
  }

  Set-Content -LiteralPath $ServerPidPath -Value $Process.Id -Encoding UTF8
  Write-LauncherLog "Started dashboard server with PID $($Process.Id) using $NodeExe"
}

function Open-LaunchingPage {
  if ($env:OFFER_DASHBOARD_NO_OPEN -eq "1") {
    Write-LauncherLog "Skipping browser launch because OFFER_DASHBOARD_NO_OPEN=1"
    return
  }

  $LaunchUri = [System.Uri]::new($LaunchPagePath).AbsoluteUri
  $RootQuery = [System.Uri]::EscapeDataString($ProjectRoot)
  $LaunchUrl = "${LaunchUri}?root=${RootQuery}"
  Write-LauncherLog "Opening $LaunchUrl"
  Start-Process $LaunchUrl
}

try {
  New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
  New-Item -ItemType Directory -Path $RuntimeDownloadsDir -Force | Out-Null
  Write-LauncherLog "Launcher started from $ProjectRoot"
  Open-LaunchingPage
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
    Write-LauncherLog "Dashboard server is still starting; leaving launching page open for continued polling."
    return
  }

} catch {
  Write-LauncherLog "Launcher failed: $($_.Exception.Message)"
  Add-Type -AssemblyName System.Windows.Forms
  $Message = "Dashboard launch failed.`r`n`r`n$($_.Exception.Message)`r`n`r`nLog: $LauncherLogPath"
  [System.Windows.Forms.MessageBox]::Show($Message, "Offer Dashboard", "OK", "Error") | Out-Null
  throw
}
