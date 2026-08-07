#Requires AutoHotkey v2.0
#SingleInstance Force

; Fallback UI helper for non-sensitive prompts only.
; It tries to find a visible button named "Accepter", "Accept", "OK" or "Oui"
; in the active window and click near its center.
;
; Safety rule:
; - Do not use this for UAC, admin elevation, Windows security dialogs, or
;   any prompt where explicit human consent is required.

global TargetLabels := ["Accepter", "Accept", "OK", "Oui"]

F9::RunUiAcceptFallback()
Esc::ExitApp()

RunUiAcceptFallback() {
    hwnd := WinExist("A")
    if !hwnd {
        TrayTip "GYM UI helper", "Aucune fenetre active detectee.", 2000
        return
    }

    title := WinGetTitle("ahk_id " hwnd)
    class := WinGetClass("ahk_id " hwnd)

    ; Hard block for known Windows security surfaces.
    if InStr(title, "User Account Control")
        or InStr(title, "Controle de compte d'utilisateur")
        or InStr(class, "#32770") && InStr(title, "Windows Security") {
        MsgBox "Blocage de securite : ce script ne clique pas sur les boites Windows sensibles.", "GYM UI helper", "Icon!"
        return
    }

    for label in TargetLabels {
        if TryClickText(hwnd, label) {
            TrayTip "GYM UI helper", "Bouton '" label "' clique.", 1500
            return
        }
    }

    TrayTip "GYM UI helper", "Aucun bouton cible trouve dans la fenetre active.", 2000
}

TryClickText(hwnd, label) {
    try {
        text := WinGetText("ahk_id " hwnd)
    } catch {
        return false
    }

    if !InStr(text, label) {
        return false
    }

    WinGetPos &winX, &winY, &winW, &winH, "ahk_id " hwnd

    ; Conservative fallback: click in the lower-right action area
    ; only after matching a target label in the active window text.
    clickX := winX + Floor(winW * 0.78)
    clickY := winY + Floor(winH * 0.88)

    MouseMove clickX, clickY, 12
    Sleep 120
    Click
    return true
}
