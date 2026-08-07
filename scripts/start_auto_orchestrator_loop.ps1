param(
    [int]$IntervalMinutes = 45,
    [int]$MaxLotsPerPass = 2
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Orchestrator = Join-Path $PSScriptRoot "run_auto_orchestrator.ps1"
$LoopLog = Join-Path $Root "governance\ai\auto_orchestrator_loop.log"

if (-not (Test-Path $Orchestrator)) {
    Write-Host "[orchestrator-loop] Script orchestrateur introuvable." -ForegroundColor Red
    exit 1
}

if ($IntervalMinutes -lt 10) {
    $IntervalMinutes = 10
}

Write-Host "[orchestrator-loop] Boucle orchestrateur demarree." -ForegroundColor Cyan
Write-Host "[orchestrator-loop] Intervalle : $IntervalMinutes minutes." -ForegroundColor Cyan
Write-Host "[orchestrator-loop] Max lots / passage : $MaxLotsPerPass" -ForegroundColor Cyan

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $LoopLog -Encoding UTF8 -Value ""
    Add-Content -LiteralPath $LoopLog -Encoding UTF8 -Value "## Passage $timestamp"
    try {
        $output = powershell -ExecutionPolicy Bypass -File $Orchestrator -MaxLots $MaxLotsPerPass 2>&1
        foreach ($line in $output) {
            Add-Content -LiteralPath $LoopLog -Encoding UTF8 -Value $line
        }
    }
    catch {
        Add-Content -LiteralPath $LoopLog -Encoding UTF8 -Value "[orchestrator-loop] ERREUR : $($_.Exception.Message)"
    }
    Start-Sleep -Seconds ($IntervalMinutes * 60)
}
