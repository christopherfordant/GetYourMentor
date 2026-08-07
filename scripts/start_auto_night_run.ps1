param(
    [int]$Hours = 8,
    [int]$IntervalMinutes = 45,
    [int]$MaxLotsPerPass = 2
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Orchestrator = Join-Path $PSScriptRoot "run_auto_orchestrator.ps1"
$LogPath = Join-Path $Root "governance\ai\auto_night_run.log"

Set-Location $Root

if (-not (Test-Path $Orchestrator)) {
    Write-Host "[night-run] Script orchestrateur introuvable." -ForegroundColor Red
    exit 1
}

if ($Hours -lt 1) {
    $Hours = 1
}
if ($IntervalMinutes -lt 10) {
    $IntervalMinutes = 10
}

$startedAt = Get-Date
$endsAt = $startedAt.AddHours($Hours)

Write-Host "[night-run] Session auto demarree." -ForegroundColor Cyan
Write-Host "[night-run] Duree : $Hours heure(s)." -ForegroundColor Cyan
Write-Host "[night-run] Intervalle : $IntervalMinutes minutes." -ForegroundColor Cyan
Write-Host "[night-run] Fin prevue : $($endsAt.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Cyan

while ((Get-Date) -lt $endsAt) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value ""
    Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value "## Passage $timestamp"
    try {
        $output = powershell -ExecutionPolicy Bypass -Command "Set-Location '$Root'; & '$Orchestrator' -MaxLots $MaxLotsPerPass" 2>&1
        foreach ($line in $output) {
            Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value $line
        }
    }
    catch {
        Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value "[night-run] ERREUR : $($_.Exception.Message)"
    }

    if ((Get-Date).AddMinutes($IntervalMinutes) -gt $endsAt) {
        break
    }
    Start-Sleep -Seconds ($IntervalMinutes * 60)
}

$endedAt = Get-Date
Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value "## Session terminee $($endedAt.ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host "[night-run] Session terminee." -ForegroundColor Green
