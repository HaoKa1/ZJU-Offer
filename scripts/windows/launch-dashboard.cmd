@echo off
setlocal
set SCRIPT_DIR=%~dp0
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%launch-dashboard.ps1"
set EXIT_CODE=%ERRORLEVEL%
if not "%EXIT_CODE%"=="0" (
  echo.
  echo Dashboard launcher failed with exit code %EXIT_CODE%.
  echo Check "%SCRIPT_DIR%data\launcher.log" for details.
  pause
)
exit /b %EXIT_CODE%
