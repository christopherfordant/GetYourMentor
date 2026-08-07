#Requires AutoHotkey v2.0
#SingleInstance Force

; Safe prompt helper:
; - detects a likely VS Code / app authorization prompt
; - brings it to front
; - moves the mouse near the probable "Autoriser / Allow / Accepter" button
; - never clicks automatically

global WatchEnabled := true
global PollMs := 900
global LastHandledHwnd := 0
global PromptTitleKeywords := ["visual studio code", "vs code", "codex", "openai", "autorisation", "authorization"]
global PromptActionKeywords := ["autoriser", "allow", "accepter", "accept", "continuer", "continue", "ok"]

TrayTip "GYM Prompt Helper", "Surveillance active. F8 pause/reprend, F9 force un scan, Esc ferme.", 2500
SetTimer WatchPrompts, PollMs

F8::ToggleWatcher()
F9::WatchPrompts()
Esc::ExitApp()

ToggleWatcher() {
    global WatchEnabled
    WatchEnabled := !WatchEnabled
    state := WatchEnabled ? "active" : "en pause"
    TrayTip "GYM Prompt Helper", "Surveillance " state ".", 1500
}

WatchPrompts() {
    global WatchEnabled, LastHandledHwnd
    if !WatchEnabled {
        return
    }

    hwndList := WinGetList()
    for hwnd in hwndList {
        if !WinExist("ahk_id " hwnd) {
            continue
        }
        if !IsCandidatePrompt(hwnd) {
            continue
        }
        if hwnd = LastHandledHwnd {
            continue
        }
        FocusAndPlaceMouse(hwnd)
        LastHandledHwnd := hwnd
        return
    }
}

IsCandidatePrompt(hwnd) {
    global PromptTitleKeywords, PromptActionKeywords

    try title := StrLower(WinGetTitle("ahk_id " hwnd))
    catch
        return false

    try text := StrLower(WinGetText("ahk_id " hwnd))
    catch
        text := ""

    ; Explicitly avoid Windows security / UAC surfaces.
    if InStr(title, "user account control")
        or InStr(title, "controle de compte d'utilisateur")
        or InStr(title, "windows security")
        or InStr(text, "do you want to allow this app")
        or InStr(text, "voulez-vous autoriser cette application") {
        return false
    }

    titleMatch := false
    for keyword in PromptTitleKeywords {
        if InStr(title, keyword) {
            titleMatch := true
            break
        }
    }

    actionMatch := false
    for keyword in PromptActionKeywords {
        if InStr(text, keyword) || InStr(title, keyword) {
            actionMatch := true
            break
        }
    }

    return titleMatch && actionMatch
}

FocusAndPlaceMouse(hwnd) {
    WinActivate "ahk_id " hwnd
    WinWaitActive "ahk_id " hwnd, , 1
    WinGetPos &x, &y, &w, &h, "ahk_id " hwnd

    ; Conservative placement:
    ; most app prompts place the primary action bottom-right.
    targetX := x + Floor(w * 0.78)
    targetY := y + Floor(h * 0.86)

    SoundBeep 1100, 120
    Sleep 120
    MouseMove targetX, targetY, 10
    TrayTip "GYM Prompt Helper", "Fenetre detectee. Curseur place sur l'action probable, sans clic.", 1800
}
