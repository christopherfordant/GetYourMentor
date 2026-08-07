#Requires AutoHotkey v2.0
#SingleInstance Force

; Robust fallback based on clipboard and paste.
; F6  -> copy "continue" to clipboard
; F7  -> paste "continue" in active field
; F8  -> paste "continue" then press Enter
; Esc -> quit

global PreviousClipboard := ""

TrayTip "GYM Clipboard Helper", "F6 copie, F7 colle, F8 colle+envoie, Esc ferme.", 2500

F6::CopyContinue()
F7::PasteContinue(false)
F8::PasteContinue(true)
Esc::ExitApp()

CopyContinue() {
    global PreviousClipboard
    PreviousClipboard := A_Clipboard
    A_Clipboard := "continue"
    ClipWait(1)
    SoundBeep(900, 90)
}

PasteContinue(sendEnter := false) {
    global PreviousClipboard
    PreviousClipboard := A_Clipboard
    A_Clipboard := "continue"
    if !ClipWait(1) {
        SoundBeep(500, 140)
        return
    }
    Sleep(60)
    Send("^v")
    Sleep(80)
    if sendEnter {
        Send("{Enter}")
    }
}
