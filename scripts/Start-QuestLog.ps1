$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$logsDirectory = Join-Path $projectRoot "logs"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = Join-Path $logsDirectory "questlog-$timestamp.log"

if (-not (Test-Path -LiteralPath $logsDirectory)) {
  New-Item -ItemType Directory -Path $logsDirectory | Out-Null
}

Write-Host ""
Write-Host "QuestLog launcher" -ForegroundColor Cyan
Write-Host "Project: $projectRoot"
Write-Host "Log file: $logFile"
Write-Host "Press Ctrl+C to stop the local server."
Write-Host ""

Push-Location $projectRoot

try {
  $env:QUESTLOG_NO_OPEN = "0"
  & npm.cmd start 2>&1 | Tee-Object -FilePath $logFile -Append
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
}

if ($null -ne $exitCode -and $exitCode -ne 0) {
  Write-Host ""
  Write-Host "QuestLog exited with code $exitCode" -ForegroundColor Red
  exit $exitCode
}
