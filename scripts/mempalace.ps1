param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $MempalaceArgs
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$VenvPython = Join-Path $Root "mempalace\.venv\Scripts\python.exe"
$Runtime = Join-Path $Root ".mempalace-exec"
$Palace = Join-Path $Root ".mempalace\palace"

if (-not (Test-Path $VenvPython)) {
    throw "MemPalace venv introuvable: $VenvPython"
}

New-Item -ItemType Directory -Force -Path $Runtime | Out-Null

$env:PYTHONIOENCODING = "utf-8"
$env:HOME = $Runtime
$env:USERPROFILE = $Runtime
$env:XDG_CACHE_HOME = Join-Path $Runtime ".cache"
$env:MEMPALACE_PALACE_PATH = $Palace

if (-not $MempalaceArgs -or $MempalaceArgs.Count -eq 0) {
    $MempalaceArgs = @("status")
}

& $VenvPython -m mempalace --palace $Palace @MempalaceArgs
