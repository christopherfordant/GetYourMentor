$Root = Split-Path -Parent $PSScriptRoot
$Python = "python"
$Supervisor = Join-Path $PSScriptRoot "fil_rouge_supervisor.py"
$Report = Join-Path $Root "governance\\ai\\last_supervision_report.md"

Write-Host "[fil-rouge] Verification avant push..." -ForegroundColor Cyan

& $Python $Supervisor
$ExitCode = $LASTEXITCODE

if ($ExitCode -ne 0) {
    Write-Host "[fil-rouge] Echec de conformite. Push bloque." -ForegroundColor Red
    if (Test-Path $Report) {
        Write-Host "[fil-rouge] Rapport :" -ForegroundColor Yellow
        Get-Content $Report
    }
    exit $ExitCode
}

Write-Host "[fil-rouge] STATUT : CONFORME. Push autorise." -ForegroundColor Green
exit 0
