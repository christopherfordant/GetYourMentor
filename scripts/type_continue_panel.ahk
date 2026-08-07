#Requires AutoHotkey v2.0
#SingleInstance Force
Persistent

; Simple clickable panel to avoid hotkey issues.
; Buttons:
; - Test: visible confirmation
; - Continue: types "continue"
; - Continue+Envoi: types "continue" then Enter
; - Quitter: closes the panel

panel := Gui("+AlwaysOnTop +ToolWindow -MinimizeBox -MaximizeBox", "GYM Continue Panel")
panel.SetFont("s10", "Segoe UI")
panel.MarginX := 12
panel.MarginY := 12

panel.AddText("w260", "Panel de secours si les raccourcis ne fonctionnent pas.")

btnTest := panel.AddButton("xm w120 h32", "Test")
btnContinue := panel.AddButton("x+8 w120 h32", "Continue")
btnSend := panel.AddButton("xm w248 h34", "Continue + Envoi")
btnQuit := panel.AddButton("xm w248 h30", "Quitter")

btnTest.OnEvent("Click", (*) => MsgBox("Le panneau AHK fonctionne bien.", "GYM Continue Panel"))
btnContinue.OnEvent("Click", (*) => SendText("continue"))
btnSend.OnEvent("Click", (*) => (SendText("continue"), Sleep(80), Send("{Enter}")))
btnQuit.OnEvent("Click", (*) => ExitApp())
panel.OnEvent("Close", (*) => ExitApp())

SoundBeep(1000, 120)
MsgBox "Le panneau va s'ouvrir au centre de l'ecran.", "GYM Continue Panel"
panel.Show("Center AutoSize")
WinActivate("GYM Continue Panel")
