$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$StatePath = Join-Path $Root "governance\ai\auto_mode_state.json"
$JournalPath = Join-Path $Root "governance\ai\auto_mode_journal.md"

if (-not (Test-Path $StatePath)) {
    Write-Host "[auto-state] Etat auto introuvable." -ForegroundColor Red
    exit 1
}

$state = Get-Content -LiteralPath $StatePath -Raw | ConvertFrom-Json

Write-Host "[auto-state] Dernier cycle : $($state.last_cycle_at)" -ForegroundColor Cyan
Write-Host "[auto-state] Dernier statut superviseur : $($state.last_supervisor_status)" -ForegroundColor Cyan
Write-Host "[auto-state] Phase active : $($state.active_phase)" -ForegroundColor Cyan
Write-Host "[auto-state] Action recommandee : $($state.next_recommended_action)" -ForegroundColor Cyan
Write-Host "[auto-state] Focus : $($state.last_focus)" -ForegroundColor Cyan

if ($state.notes -and $state.notes.Count -gt 0) {
    Write-Host "[auto-state] Notes :" -ForegroundColor Yellow
    foreach ($note in $state.notes) {
        Write-Host " - $note"
    }
}

if (Test-Path $JournalPath) {
    Write-Host "[auto-state] Journal : $JournalPath" -ForegroundColor DarkGray
}
