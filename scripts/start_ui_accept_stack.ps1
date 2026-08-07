param(
    [switch]$ForceFallback
)

$padPackage = Get-AppxPackage -Name "Microsoft.PowerAutomateDesktop" -ErrorAction SilentlyContinue
$padExe = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps\PAD.Console.Host.exe"
$fallback = Join-Path $PSScriptRoot "start_ui_accept_fallback.ps1"

if ($ForceFallback) {
    Write-Host "[ui-stack] Fallback force vers AutoHotkey." -ForegroundColor Yellow
    & powershell -ExecutionPolicy Bypass -File $fallback
    exit $LASTEXITCODE
}

if ($padPackage -and (Test-Path $padExe)) {
    Write-Host "[ui-stack] Power Automate Desktop detecte. Ouverture du chemin principal..." -ForegroundColor Cyan
    Start-Process -FilePath $padExe
    Write-Host "[ui-stack] Si PAD ne reconnait pas le bouton cible, relance avec -ForceFallback." -ForegroundColor Green
    exit 0
}

Write-Host "[ui-stack] PAD indisponible. Bascule automatique vers AutoHotkey." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File $fallback
exit $LASTEXITCODE
