$AhkScript = Join-Path $PSScriptRoot "focus_authorization_prompt.ahk"
$AhkExe = "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe"

if (-not (Test-Path $AhkScript)) {
    Write-Host "[prompt-helper] Script introuvable." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $AhkExe)) {
    Write-Host "[prompt-helper] AutoHotkey introuvable a l'emplacement attendu." -ForegroundColor Red
    exit 1
}

Write-Host "[prompt-helper] Lancement du helper de focus pour fenetres d'autorisation applicatives..." -ForegroundColor Cyan
Start-Process -FilePath $AhkExe -ArgumentList "`"$AhkScript`"" -WindowStyle Hidden
Write-Host "[prompt-helper] Actif : F8 pause/reprend, F9 force un scan, Esc ferme." -ForegroundColor Green
