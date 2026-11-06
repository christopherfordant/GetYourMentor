param([switch]$DryRun)

# Legacy entry: inspect before any state, executable, log or process access.
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'orchestration_gate.ps1') -EntryPoint 'start_fil_rouge_supervisor.ps1' -DryRun:$DryRun
if ($DryRun) { return }

$Root = Split-Path -Parent $PSScriptRoot
$Python = "python"
$Script = Join-Path $PSScriptRoot "fil_rouge_supervisor.py"
$Log = Join-Path $Root "governance\\ai\\supervisor_loop.log"

while ($true) {
    & $Python $Script *>> $Log
    Start-Sleep -Seconds 120
}
