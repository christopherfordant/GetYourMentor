#Requires AutoHotkey v2.0
#SingleInstance Force
#UseHook
#InstallKeybdHook
#Warn

; Helper to quickly write "continue".
; F6  -> writes "continue" in the current field
; F7  -> writes "continue" then presses Enter in the current field
; Ctrl+Alt+C -> targets the active browser or VS Code chat area, clicks near the composer,
;        writes "continue", then presses Enter
; F12 and Ctrl+Shift+Alt+C -> rescue triggers for debugging if Ctrl+Alt+C is swallowed
; Esc -> closes the helper

global LogPath := A_ScriptDir "\type_continue_helper.log"

LogLine("START script launched")
TrayTip "GYM Continue Helper", "F6 ecrit, F7 ecrit+envoie, Ctrl+Alt+C ou F12 pour le chat, F10 debug, Esc ferme.", 2500

F6::TypeContinue(false)
F7::TypeContinue(true)
^!c::TypeContinueInBrowserChat()
^+!c::TypeContinueInBrowserChat()
F12::TypeContinueInBrowserChat()
F10::ShowHelperDebug()
Pause::ShowHelperDebug()
Esc::ExitApp()

TypeContinue(sendEnter := false) {
    LogLine("TypeContinue sendEnter=" (sendEnter ? "true" : "false"))
    SendText("continue")
    if sendEnter {
        Sleep 80
        Send("{Enter}")
    }
}

TypeContinueInBrowserChat() {
    LogLine("Ctrl+Alt+C pressed")
    SoundBeep(900, 90)
    hwnd := WinExist("A")
    if !hwnd {
        LogLine("No active window")
        TrayTip "GYM Continue Helper", "Aucune fenetre active detectee.", 1500
        return
    }

    try processName := WinGetProcessName("ahk_id " hwnd)
    catch as err {
        LogLine("Process detection failed: " err.Message)
        TrayTip "GYM Continue Helper", "Impossible de lire le processus actif.", 1500
        return
    }

    LogLine("Active process=" processName)
    if !IsBrowserProcess(processName) {
        LogLine("Unsupported process")
        TrayTip "GYM Continue Helper", "La fenetre active n'est ni un navigateur supporte ni VS Code.", 1800
        return
    }

    WinActivate "ahk_id " hwnd
    WinWaitActive "ahk_id " hwnd, , 1
    WinGetPos &x, &y, &w, &h, "ahk_id " hwnd

    ; Heuristic for chat composers placed at the bottom center of the page.
    ; Works for browsers and VS Code panels/webviews where the chat input
    ; is usually near the lower middle area.
    targetX := x + Floor(w * 0.50)
    targetY := y + Floor(h * 0.965)

    LogLine("Target x=" targetX " y=" targetY " w=" w " h=" h)

    MouseMove targetX, targetY, 10
    Sleep 120
    Click
    Sleep 140
    Send("^a")
    Sleep 60
    SendText("continue")
    Sleep 80
    Send("{Enter}")
    LogLine("continue sent")
    TrayTip "GYM Continue Helper", "continue envoye", 1200
}

IsBrowserProcess(processName) {
    lower := StrLower(processName)
    return lower = "msedge.exe"
        or lower = "chrome.exe"
        or lower = "firefox.exe"
        or lower = "brave.exe"
        or lower = "opera.exe"
        or lower = "code.exe"
}

ShowHelperDebug() {
    hwnd := WinExist("A")
    title := hwnd ? WinGetTitle("ahk_id " hwnd) : "(none)"
    processName := hwnd ? WinGetProcessName("ahk_id " hwnd) : "(none)"
    LogLine("F10 debug process=" processName " title=" title)
    TrayTip "GYM Continue Helper", "Processus actif : " processName, 1500
}

LogLine(message) {
    global LogPath
    timestamp := FormatTime(, "yyyy-MM-dd HH:mm:ss")
    FileAppend(timestamp " | " message "`n", LogPath, "UTF-8")
}
