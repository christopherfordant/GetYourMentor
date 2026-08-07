$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$StatePath = Join-Path $Root "governance\ai\auto_mode_state.json"
$JournalPath = Join-Path $Root "governance\ai\auto_mode_journal.md"
$ReportPath = Join-Path $Root "governance\ai\last_supervision_report.md"
$SupervisorScript = Join-Path $PSScriptRoot "fil_rouge_supervisor.py"
$Python = "python"

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

function Ensure-Journal {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        Set-Content -LiteralPath $Path -Encoding UTF8 -Value "# Journal Auto Mode GYM`r`n"
    }
}

function Add-JournalEntry {
    param(
        [string]$Path,
        [string]$Title,
        [string[]]$Lines
    )
    Ensure-Journal -Path $Path
    Add-Content -LiteralPath $Path -Encoding UTF8 -Value ""
    Add-Content -LiteralPath $Path -Encoding UTF8 -Value "## $Title"
    Add-Content -LiteralPath $Path -Encoding UTF8 -Value ""
    foreach ($line in $Lines) {
        Add-Content -LiteralPath $Path -Encoding UTF8 -Value "- $line"
    }
}

function Get-SupervisorStatus {
    param([string]$ReportPath)
    if (-not (Test-Path $ReportPath)) {
        return "UNKNOWN"
    }
    $content = Get-Content -LiteralPath $ReportPath -Raw
    if ($content -match "STATUT : CONFORME") {
        return "CONFORME"
    }
    if ($content -match "STATUT : ALERTE") {
        return "ALERTE"
    }
    return "UNKNOWN"
}

function Get-NextPhase {
    param([string]$Current)
    $order = @("CTO", "PRODUCT", "DESIGN", "DEVOPS", "QA", "SEO")
    $index = [Array]::IndexOf($order, $Current)
    if ($index -lt 0 -or $index -ge ($order.Count - 1)) {
        return $order[0]
    }
    return $order[$index + 1]
}

$state = Read-JsonFile -Path $StatePath
if ($null -eq $state) {
    $state = [pscustomobject]@{
        last_cycle_at = $null
        last_supervisor_status = "UNKNOWN"
        active_phase = "CTO"
        next_recommended_action = "Initialiser le premier cycle auto projet"
        last_focus = "Relire les documents directeurs puis lancer le superviseur"
        notes = @()
    }
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$gitBranch = git branch --show-current 2>$null
if (-not $gitBranch) {
    $gitBranch = "(inconnue)"
}

$gitStatusShort = git status --short 2>$null
if (-not $gitStatusShort) {
    $gitStatusShort = @("(aucune modification detectee ou git indisponible)")
}

& $Python $SupervisorScript | Out-Null
$supervisorStatus = Get-SupervisorStatus -ReportPath $ReportPath

$nextPhase = if ($supervisorStatus -eq "CONFORME") {
    Get-NextPhase -Current $state.active_phase
} else {
    $state.active_phase
}

$nextAction = if ($supervisorStatus -eq "CONFORME") {
    "Continuer le cycle sur la phase $nextPhase"
} else {
    "Traiter les alertes du superviseur avant toute action suivante"
}

$state.last_cycle_at = $timestamp
$state.last_supervisor_status = $supervisorStatus
$state.active_phase = $nextPhase
$state.next_recommended_action = $nextAction
$state.last_focus = "Cycle auto relance avec verification fil rouge"
$state.notes = @(
    "Branche active: $gitBranch",
    "Statut superviseur: $supervisorStatus",
    "Phase suivante: $nextPhase"
)

Write-JsonFile -Path $StatePath -Data $state

$journalLines = @(
    "Date du cycle : $timestamp",
    "Branche active : $gitBranch",
    "Statut superviseur : $supervisorStatus",
    "Phase suivante : $nextPhase",
    "Action recommandee : $nextAction",
    "Etat Git :"
)

Add-JournalEntry -Path $JournalPath -Title "Cycle auto $timestamp" -Lines $journalLines
foreach ($gitLine in $gitStatusShort) {
    Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "  - $gitLine"
}

Write-Output "[auto-mode] Cycle termine."
Write-Output "[auto-mode] Statut superviseur : $supervisorStatus"
Write-Output "[auto-mode] Phase suivante : $nextPhase"
Write-Output "[auto-mode] Action recommandee : $nextAction"
