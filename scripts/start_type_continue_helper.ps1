$AhkScript = Join-Path $PSScriptRoot "type_continue_helper.ahk"
$PreferredAhkExe = "C:\Program Files\AutoHotkey\v2\AutoHotkey64_UIA.exe"
$FallbackAhkExe = "C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe"
$LogFile = Join-Path $PSScriptRoot "type_continue_helper.log"

if (-not (Test-Path $AhkScript)) {
    Write-Host "[continue-helper] Script introuvable." -ForegroundColor Red
    exit 1
}

if (Test-Path $FallbackAhkExe) {
    $AhkExe = $FallbackAhkExe
}
elseif (Test-Path $PreferredAhkExe) {
    $AhkExe = $PreferredAhkExe
}
else {
    Write-Host "[continue-helper] AutoHotkey introuvable a l'emplacement attendu." -ForegroundColor Red
    exit 1
}

Write-Host "[continue-helper] Lancement du helper 'continue'..." -ForegroundColor Cyan
if (Test-Path $LogFile) {
    Remove-Item -LiteralPath $LogFile -Force -ErrorAction SilentlyContinue
}
Start-Process -FilePath $AhkExe -ArgumentList "`"$AhkScript`"" -WindowStyle Hidden
Write-Host "[continue-helper] Pret : F6 ecrit, F7 ecrit+envoie, Ctrl+Alt+C ou F12 pour le chat, F10 ou Pause debug, Esc ferme." -ForegroundColor Green
