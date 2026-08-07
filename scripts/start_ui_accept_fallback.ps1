$Root = Split-Path -Parent $PSScriptRoot
$AhkScript = Join-Path $PSScriptRoot "ui_accept_fallback.ahk"
$AhkExe = "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe"

if (-not (Test-Path $AhkScript)) {
    Write-Host "[ui-helper] Script AutoHotkey introuvable." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $AhkExe)) {
    Write-Host "[ui-helper] AutoHotkey introuvable a l'emplacement attendu." -ForegroundColor Red
    exit 1
}

Write-Host "[ui-helper] Lancement du fallback AutoHotkey pour confirmations UI non sensibles..." -ForegroundColor Cyan
Start-Process -FilePath $AhkExe -ArgumentList "`"$AhkScript`"" -WindowStyle Hidden
Write-Host "[ui-helper] Pret. Raccourci : F9 pour tenter un clic sur 'Accepter' dans la fenetre active." -ForegroundColor Green
