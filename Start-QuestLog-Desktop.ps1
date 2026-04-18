$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$logsDirectory = Join-Path $projectRoot "logs"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = Join-Path $logsDirectory "questlog-desktop-$timestamp.log"
$electronEntry = Join-Path $projectRoot "node_modules\electron\cli.js"

if (-not (Test-Path -LiteralPath $logsDirectory)) {
  New-Item -ItemType Directory -Path $logsDirectory | Out-Null
}

Write-Host ""
Write-Host "QuestLog desktop launcher" -ForegroundColor Cyan
Write-Host "Project: $projectRoot"
Write-Host "Log file: $logFile"
Write-Host ""

Push-Location $projectRoot

try {
  if (-not (Test-Path -LiteralPath $electronEntry)) {
    Write-Host "Electron is not installed yet. Running npm install first..." -ForegroundColor Yellow
    & npm.cmd install

    if ($LASTEXITCODE -ne 0) {
      throw "npm install failed with exit code $LASTEXITCODE."
    }
  }

  Write-Host "Launching QuestLog desktop app..."
  Write-Host ""

  & npm.cmd run desktop-start 2>&1 | Tee-Object -FilePath $logFile -Append
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
}

if ($null -ne $exitCode -and $exitCode -ne 0) {
  Write-Host ""
  Write-Host "QuestLog desktop exited with code $exitCode" -ForegroundColor Red
  exit $exitCode
}
