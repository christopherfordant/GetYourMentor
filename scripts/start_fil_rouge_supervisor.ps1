$Root = Split-Path -Parent $PSScriptRoot
$Python = "python"
$Script = Join-Path $PSScriptRoot "fil_rouge_supervisor.py"
$Log = Join-Path $Root "governance\\ai\\supervisor_loop.log"

while ($true) {
    & $Python $Script *>> $Log
    Start-Sleep -Seconds 120
}
