$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$AutoCycleScript = Join-Path $PSScriptRoot "run_auto_project_cycle.ps1"
$StatePath = Join-Path $Root "governance\ai\auto_mode_state.json"
$JournalPath = Join-Path $Root "governance\ai\auto_mode_journal.md"
$LotJournalPath = Join-Path $Root "governance\ai\auto_visual_audit_journal.md"
$GymNextPath = Join-Path $Root "gym-next"
$ArtifactsPath = Join-Path $GymNextPath "playwright-artifacts"
$NpmCmd = "npm.cmd"
$AuditTimeoutSeconds = 210
$ExpectedAuditFiles = @(
    "desktop-chromium-home.png",
    "desktop-chromium-recherche-football.png",
    "desktop-chromium-coachs-paris.png",
    "desktop-chromium-coach-fitness.png",
    "desktop-chromium-creneau.png",
    "desktop-chromium-compte.png",
    "desktop-chromium-inscription-club.png",
    "mobile-chromium-home.png",
    "mobile-chromium-recherche-football.png",
    "mobile-chromium-coachs-paris.png",
    "mobile-chromium-coach-fitness.png",
    "mobile-chromium-creneau.png",
    "mobile-chromium-compte.png",
    "mobile-chromium-inscription-club.png"
)

function Read-JsonFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        return $null
    }
    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Write-JsonFile {
    param(
        [string]$Path,
        [object]$Data
    )
    $json = $Data | ConvertTo-Json -Depth 8
    $directory = Split-Path -Parent $Path
    $fileName = Split-Path -Leaf $Path
    $tempPath = Join-Path $directory ("{0}.{1}.tmp" -f $fileName, [guid]::NewGuid().ToString("N"))
    Set-Content -LiteralPath $tempPath -Value $json -Encoding UTF8
    Move-Item -LiteralPath $tempPath -Destination $Path -Force
}

function Set-StateValue {
    param(
        [object]$State,
        [string]$Name,
        [object]$Value
    )
    $prop = $State.PSObject.Properties[$Name]
    if ($null -eq $prop) {
        $State | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
    }
    else {
        $prop.Value = $Value
    }
}

function Ensure-FileWithHeader {
    param(
        [string]$Path,
        [string]$Header
    )
    if (-not (Test-Path $Path)) {
        Set-Content -LiteralPath $Path -Encoding UTF8 -Value $Header
    }
}

function Add-Lines {
    param(
        [string]$Path,
        [string[]]$Lines
    )
    foreach ($line in $Lines) {
        Add-Content -LiteralPath $Path -Encoding UTF8 -Value $line
    }
}

function Get-RecentAuditCount {
    param(
        [string]$ArtifactsPath,
        [datetime]$StartedAt,
        [string[]]$ExpectedFiles
    )
    if (-not (Test-Path $ArtifactsPath)) {
        return 0
    }
    $count = 0
    foreach ($fileName in $ExpectedFiles) {
        $filePath = Join-Path $ArtifactsPath $fileName
        if ((Test-Path $filePath) -and ((Get-Item $filePath).LastWriteTime -ge $StartedAt)) {
            $count++
        }
    }
    return $count
}

function Invoke-AuditCommand {
    param(
        [string]$WorkingDirectory,
        [int]$TimeoutSeconds
    )

    $stdoutPath = Join-Path $WorkingDirectory "pw_audit_stdout.log"
    $stderrPath = Join-Path $WorkingDirectory "pw_audit_stderr.log"

    if (Test-Path $stdoutPath) { Remove-Item -LiteralPath $stdoutPath -Force -ErrorAction SilentlyContinue }
    if (Test-Path $stderrPath) { Remove-Item -LiteralPath $stderrPath -Force -ErrorAction SilentlyContinue }

    $proc = Start-Process -FilePath $NpmCmd `
        -ArgumentList "run", "pw:audit" `
        -WorkingDirectory $WorkingDirectory `
        -RedirectStandardOutput $stdoutPath `
        -RedirectStandardError $stderrPath `
        -PassThru

    $completed = $proc.WaitForExit($TimeoutSeconds * 1000)
    if (-not $completed) {
        try {
            $proc.Kill()
        }
        catch {}
    }

    $lines = @()
    if (Test-Path $stdoutPath) {
        $lines += Get-Content -LiteralPath $stdoutPath
    }
    if (Test-Path $stderrPath) {
        $lines += Get-Content -LiteralPath $stderrPath
    }

    return [pscustomobject]@{
        completed = $completed
        exit_code = if ($completed) { $proc.ExitCode } else { 999 }
        output = $lines
    }
}

Ensure-FileWithHeader -Path $LotJournalPath -Header "# Journal Lot Auto Audit Visuel GYM`r`n"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$cycleOutput = powershell -ExecutionPolicy Bypass -File $AutoCycleScript 2>&1
$state = Read-JsonFile -Path $StatePath
if ($null -eq $state) {
    throw "Etat auto projet introuvable apres le cycle."
}

$supervisorStatus = [string]$state.last_supervisor_status
$auditStatus = "NON_LANCE"
$lotStatus = "ALERTE_SUPERVISEUR"
$auditOutput = @()

if ($supervisorStatus -eq "CONFORME") {
    Push-Location $GymNextPath
    try {
        $auditStartedAt = Get-Date
        $auditRun = Invoke-AuditCommand -WorkingDirectory $GymNextPath -TimeoutSeconds $AuditTimeoutSeconds
        $auditOutput = $auditRun.output
        $recentCount = Get-RecentAuditCount -ArtifactsPath $ArtifactsPath -StartedAt $auditStartedAt -ExpectedFiles $ExpectedAuditFiles
        if (($auditRun.completed -and $auditRun.exit_code -eq 0) -or $recentCount -ge 10) {
            $auditStatus = "OK"
            $lotStatus = "CONFORME_AUDIT_OK"
        }
        else {
            $auditStatus = "KO"
            $lotStatus = "CONFORME_AUDIT_KO"
        }
        $auditOutput += "AUDIT_COMPLETED=$($auditRun.completed)"
        $auditOutput += "AUDIT_EXIT_CODE=$($auditRun.exit_code)"
        $auditOutput += "RECENT_AUDIT_FILES=$recentCount"
    }
    finally {
        Pop-Location
    }
}
else {
    $auditStatus = "NON_LANCE"
    $lotStatus = "ALERTE_SUPERVISEUR"
}

$nextAction = if ($lotStatus -eq "CONFORME_AUDIT_OK") {
    "Continuer sur un lot metier, QA ou visuel en conservant la phase active $($state.active_phase)"
} elseif ($lotStatus -eq "CONFORME_AUDIT_KO") {
    "Analyser les artefacts Playwright avant toute progression"
} else {
    "Traiter les alertes du superviseur avant de relancer l'audit visuel"
}

Set-StateValue -State $state -Name "last_visual_audit_status" -Value $auditStatus
Set-StateValue -State $state -Name "last_visual_lot_status" -Value $lotStatus
Set-StateValue -State $state -Name "last_visual_audit_at" -Value $timestamp
Set-StateValue -State $state -Name "last_visual_artifacts_path" -Value $ArtifactsPath
Set-StateValue -State $state -Name "next_recommended_action" -Value $nextAction

$notes = @()
if ($state.notes) {
    $notes += $state.notes
}
$notes += "Dernier lot auto visuel: $lotStatus"
Set-StateValue -State $state -Name "notes" -Value ($notes | Select-Object -Last 10)

Write-JsonFile -Path $StatePath -Data $state

Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "## Lot auto $timestamp"
Add-Lines -Path $LotJournalPath -Lines @(
    "",
    "- Statut superviseur : $supervisorStatus",
    "- Statut audit visuel : $auditStatus",
    "- Statut lot : $lotStatus",
    "- Phase active : $($state.active_phase)",
    "- Artefacts : $ArtifactsPath",
    "- Action recommandee : $nextAction",
    "",
    "### Sortie cycle auto"
)
foreach ($line in $cycleOutput) {
    Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "- $line"
}
Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "### Sortie audit visuel"
if ($auditOutput.Count -gt 0) {
    foreach ($line in $auditOutput) {
        Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "- $line"
    }
}
else {
    Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "- audit non lance"
}

Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "## Lot audit visuel $timestamp"
Add-Lines -Path $JournalPath -Lines @(
    "",
    "- Statut lot : $lotStatus",
    "- Statut audit visuel : $auditStatus",
    "- Artefacts : $ArtifactsPath",
    "- Action recommandee : $nextAction"
)

Write-Output "[auto-visual] Lot termine."
Write-Output "[auto-visual] Statut superviseur : $supervisorStatus"
Write-Output "[auto-visual] Statut audit visuel : $auditStatus"
Write-Output "[auto-visual] Statut lot : $lotStatus"
Write-Output "[auto-visual] Artefacts : $ArtifactsPath"
Write-Output "[auto-visual] Action recommandee : $nextAction"
