$AhkScript = Join-Path $PSScriptRoot "type_continue_panel.ahk"
$AhkExe = "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe"

if (-not (Test-Path $AhkScript)) {
    Write-Host "[continue-panel] Script introuvable." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $AhkExe)) {
    Write-Host "[continue-panel] AutoHotkey introuvable." -ForegroundColor Red
    exit 1
}

Write-Host "[continue-panel] Lancement du panneau cliquable..." -ForegroundColor Cyan
Start-Process -FilePath $AhkExe -ArgumentList "`"$AhkScript`""
Write-Host "[continue-panel] Pret : clique sur Continue ou Continue + Envoi." -ForegroundColor Green
