Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

[System.Windows.Forms.Application]::EnableVisualStyles()

$form = New-Object System.Windows.Forms.Form
$form.Text = "GYM Continue Panel"
$form.StartPosition = "CenterScreen"
$form.Size = New-Object System.Drawing.Size(320, 220)
$form.TopMost = $true
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false

$label = New-Object System.Windows.Forms.Label
$label.Text = "Panel de secours visible pour envoyer 'continue'."
$label.AutoSize = $false
$label.Size = New-Object System.Drawing.Size(280, 40)
$label.Location = New-Object System.Drawing.Point(18, 16)

$btnTest = New-Object System.Windows.Forms.Button
$btnTest.Text = "Test"
$btnTest.Size = New-Object System.Drawing.Size(120, 32)
$btnTest.Location = New-Object System.Drawing.Point(18, 70)
$btnTest.Add_Click({
    [System.Windows.Forms.MessageBox]::Show("Le panneau Windows fonctionne bien.", "GYM Continue Panel")
})

$btnContinue = New-Object System.Windows.Forms.Button
$btnContinue.Text = "Continue"
$btnContinue.Size = New-Object System.Drawing.Size(120, 32)
$btnContinue.Location = New-Object System.Drawing.Point(158, 70)
$btnContinue.Add_Click({
    [System.Windows.Forms.SendKeys]::SendWait("continue")
})

$btnSend = New-Object System.Windows.Forms.Button
$btnSend.Text = "Continue + Envoi"
$btnSend.Size = New-Object System.Drawing.Size(260, 36)
$btnSend.Location = New-Object System.Drawing.Point(18, 114)
$btnSend.Add_Click({
    [System.Windows.Forms.SendKeys]::SendWait("continue")
    Start-Sleep -Milliseconds 80
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
})

$btnQuit = New-Object System.Windows.Forms.Button
$btnQuit.Text = "Quitter"
$btnQuit.Size = New-Object System.Drawing.Size(260, 30)
$btnQuit.Location = New-Object System.Drawing.Point(18, 156)
$btnQuit.Add_Click({ $form.Close() })

$form.Controls.Add($label)
$form.Controls.Add($btnTest)
$form.Controls.Add($btnContinue)
$form.Controls.Add($btnSend)
$form.Controls.Add($btnQuit)

[System.Media.SystemSounds]::Asterisk.Play()
$form.Add_Shown({ $form.Activate() })
[void]$form.ShowDialog()
