#Requires AutoHotkey v2.0
#SingleInstance Force
#UseHook
#InstallKeybdHook

; Debug helper:
; - Ctrl+Shift+9 shows a visible message box
; - Ctrl+Shift+0 writes "continue" in the active field
; - Ctrl+Alt+0 writes "continue" then presses Enter
; - Esc exits

MsgBox "Helper debug actif.`n`nCtrl+Shift+9 = test visible`nCtrl+Shift+0 = ecrit continue`nCtrl+Alt+0 = ecrit puis envoie", "GYM Debug Helper"

^+9:: {
    MsgBox "Le raccourci debug est bien capte par AutoHotkey.", "GYM Debug Helper"
}

^+0:: {
    SendText("continue")
}

^!0:: {
    SendText("continue")
    Sleep 80
    Send("{Enter}")
}

Esc::ExitApp()
