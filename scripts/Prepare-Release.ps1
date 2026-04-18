$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$releaseRoot = Join-Path $projectRoot "release"

# Desktop installers should be published as GitHub Release assets, not committed
# into the release snapshot. Keep local build output in /dist and attach it
# manually to the matching GitHub Release entry.

$itemsToCopy = @(
  "assets",
  "desktop",
  "css",
  "js",
  "scripts",
  "CHANGELOG.md",
  "index.html",
  "LICENSE",
  "LICENSE-LOGO-CC-BY-4.0.txt",
  "package.json",
  "README.md",
  "server.js"
)

$legacyReleaseFiles = @(
  "Launch-QuestLog-Desktop.cmd",
  "Start-QuestLog.ps1",
  "Start-QuestLog-Desktop.ps1",
  "Prepare-Release.ps1"
)

if (-not (Test-Path -LiteralPath $releaseRoot)) {
  New-Item -ItemType Directory -Path $releaseRoot | Out-Null
}

foreach ($legacyFile in $legacyReleaseFiles) {
  $legacyPath = Join-Path $releaseRoot $legacyFile
  if (Test-Path -LiteralPath $legacyPath) {
    Remove-Item -LiteralPath $legacyPath -Force
  }
}

foreach ($item in $itemsToCopy) {
  $sourcePath = Join-Path $projectRoot $item
  $destinationPath = Join-Path $releaseRoot $item

  if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Missing required release item: $item"
  }

  if (Test-Path -LiteralPath $sourcePath -PathType Container) {
    if (-not (Test-Path -LiteralPath $destinationPath)) {
      New-Item -ItemType Directory -Path $destinationPath | Out-Null
    }

    robocopy $sourcePath $destinationPath /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    if ($LASTEXITCODE -ge 8) {
      throw "Failed to mirror release directory: $item"
    }
  } else {
    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
  }
}

$releasePackagePath = Join-Path $releaseRoot "package.json"
$releasePackage = Get-Content -LiteralPath $releasePackagePath -Raw | ConvertFrom-Json

if ($releasePackage.scripts.PSObject.Properties["desktop-test"]) {
  $releasePackage.scripts.PSObject.Properties.Remove("desktop-test")
}

$releasePackage | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $releasePackagePath

$releaseGitIgnore = @"
node_modules/
logs/
dist/

.DS_Store
Thumbs.db

npm-debug.log*
yarn-debug.log*
yarn-error.log*

.env
.env.*
"@

Set-Content -LiteralPath (Join-Path $releaseRoot ".gitignore") -Value $releaseGitIgnore -NoNewline

Write-Host "Release folder refreshed at: $releaseRoot"
