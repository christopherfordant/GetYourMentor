$AhkScript = Join-Path $PSScriptRoot "type_continue_debug.ahk"
$AhkExe = "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe"

if (-not (Test-Path $AhkScript)) {
    Write-Host "[continue-debug] Script introuvable." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $AhkExe)) {
    Write-Host "[continue-debug] AutoHotkey introuvable." -ForegroundColor Red
    exit 1
}

Write-Host "[continue-debug] Lancement du helper debug visible..." -ForegroundColor Cyan
Start-Process -FilePath $AhkExe -ArgumentList "`"$AhkScript`""
Write-Host "[continue-debug] Pret : Ctrl+Shift+9 test visible, Ctrl+Shift+0 ecrit, Ctrl+Alt+0 envoie." -ForegroundColor Green
