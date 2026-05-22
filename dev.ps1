$nodeDir = "C:\Program Files\nodejs"
$npm = "$nodeDir\npm.cmd"
if (-not (Test-Path $npm)) { Write-Error "Install Node.js from https://nodejs.org/"; exit 1 }
$env:Path = "$nodeDir;$env:Path"
Set-Location $PSScriptRoot
Write-Host "OrphaCare GH -> http://localhost:3000"
& $npm run dev
