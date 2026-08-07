param(
    [int]$IntervalMinutes = 30
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$CycleScript = Join-Path $PSScriptRoot "run_auto_project_cycle.ps1"
$LoopLog = Join-Path $Root "governance\ai\auto_mode_loop.log"

if (-not (Test-Path $CycleScript)) {
    Write-Host "[auto-loop] Script de cycle introuvable." -ForegroundColor Red
    exit 1
}

if ($IntervalMinutes -lt 5) {
    $IntervalMinutes = 5
}

Write-Host "[auto-loop] Boucle auto projet demarree." -ForegroundColor Cyan
Write-Host "[auto-loop] Intervalle : $IntervalMinutes minutes." -ForegroundColor Cyan
Write-Host "[auto-loop] Log : $LoopLog" -ForegroundColor Cyan

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $LoopLog -Encoding UTF8 -Value ""
    Add-Content -LiteralPath $LoopLog -Encoding UTF8 -Value "## Passage $timestamp"
    try {
        $output = powershell -ExecutionPolicy Bypass -File $CycleScript 2>&1
        foreach ($line in $output) {
            Add-Content -LiteralPath $LoopLog -Encoding UTF8 -Value $line
        }
    }
    catch {
        Add-Content -LiteralPath $LoopLog -Encoding UTF8 -Value "[auto-loop] ERREUR : $($_.Exception.Message)"
    }

    Start-Sleep -Seconds ($IntervalMinutes * 60)
}
