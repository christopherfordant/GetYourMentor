$AhkScript = Join-Path $PSScriptRoot "clipboard_continue.ahk"
$AhkExe = "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe"

if (-not (Test-Path $AhkScript)) {
    Write-Host "[clipboard-helper] Script introuvable." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $AhkExe)) {
    Write-Host "[clipboard-helper] AutoHotkey introuvable." -ForegroundColor Red
    exit 1
}

Write-Host "[clipboard-helper] Lancement du helper presse-papiers..." -ForegroundColor Cyan
Start-Process -FilePath $AhkExe -ArgumentList "`"$AhkScript`"" -WindowStyle Hidden
Write-Host "[clipboard-helper] Pret : F6 copie, F7 colle, F8 colle+envoie, Esc ferme." -ForegroundColor Green
