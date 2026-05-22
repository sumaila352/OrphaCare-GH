# Run Git when your terminal PATH does not include Git yet (restart terminal after install).
param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$gitExe = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $gitExe)) {
  Write-Error "Git not found. Install: winget install Git.Git"
  exit 1
}

$env:Path = "$(Split-Path $gitExe -Parent);$env:Path"
Set-Location $PSScriptRoot
& $gitExe @Args
exit $LASTEXITCODE
