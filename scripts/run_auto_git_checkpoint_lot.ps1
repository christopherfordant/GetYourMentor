param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$StatePath = Join-Path $Root "governance\ai\auto_mode_state.json"
$JournalPath = Join-Path $Root "governance\ai\auto_mode_journal.md"
$LotJournalPath = Join-Path $Root "governance\ai\auto_git_checkpoint_journal.md"

$IncludePaths = @(
    ".gitignore",
    "DOCUMENT_MAITRE_GYM.md",
    "docs/UI_AUTOMATION_FALLBACK_GYM.md",
    "governance",
    "scripts"
)

$ExcludePaths = @(
    "governance/ai/supervisor_loop.log",
    "governance/ai/auto_mode_loop.log",
    "governance/ai/auto_orchestrator_loop.log",
    "gym-next/pw_audit_stdout.log",
    "gym-next/pw_audit_stderr.log"
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

function Get-TargetChanges {
    param(
        [string[]]$IncludePaths,
        [string[]]$ExcludePaths
    )
    $statusLines = git status --short -- $IncludePaths 2>$null
    if (-not $statusLines) {
        return @()
    }

    $result = @()
    foreach ($line in $statusLines) {
        $path = ($line -replace '^\s*[MADRCU\?]+\s+', '').Trim()
        if (-not $path) { continue }
        $normalized = $path.Replace('\', '/')
        if ($ExcludePaths -contains $normalized) { continue }
        $result += $normalized
    }
    return $result | Sort-Object -Unique
}

Ensure-FileWithHeader -Path $LotJournalPath -Header "# Journal Lot Auto Git Checkpoint GYM`r`n"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$state = Read-JsonFile -Path $StatePath
if ($null -eq $state) {
    throw "Etat auto projet introuvable."
}

$branch = git branch --show-current 2>$null
if (-not $branch) { $branch = "(inconnue)" }

$targetChanges = Get-TargetChanges -IncludePaths $IncludePaths -ExcludePaths $ExcludePaths
$checkpointStatus = "CHECKPOINT_SKIPPED"
$commitHash = ""
$nextAction = "Aucun changement cible a checkpoint localement"

if ($state.last_supervisor_status -ne "CONFORME") {
    $checkpointStatus = "CHECKPOINT_ALERT"
    $nextAction = "Traiter d'abord l'alerte superviseur avant tout checkpoint Git"
}
elseif ($targetChanges.Count -gt 0) {
    if ($DryRun) {
        $checkpointStatus = "CHECKPOINT_SKIPPED"
        $nextAction = "Dry run termine, checkpoint reel possible sur les fichiers cibles"
    }
    else {
        git add -- $targetChanges
        $commitMessage = "Checkpoint auto local: gouvernance et orchestration"
        git commit -m $commitMessage | Out-Null
        $commitHash = git rev-parse --short HEAD
        $checkpointStatus = "CHECKPOINT_CREATED"
        $nextAction = "Checkpoint local cree, lot push GitHub peut etre prepare"
    }
}

Set-StateValue -State $state -Name "last_checkpoint_status" -Value $checkpointStatus
Set-StateValue -State $state -Name "last_checkpoint_at" -Value $timestamp
Set-StateValue -State $state -Name "last_checkpoint_branch" -Value $branch
Set-StateValue -State $state -Name "last_checkpoint_files" -Value $targetChanges
Set-StateValue -State $state -Name "last_checkpoint_commit" -Value $commitHash
Set-StateValue -State $state -Name "next_recommended_action" -Value $nextAction

$notes = @()
if ($state.notes) { $notes += $state.notes }
$notes += "Dernier checkpoint local: $checkpointStatus"
Set-StateValue -State $state -Name "notes" -Value ($notes | Select-Object -Last 12)

Write-JsonFile -Path $StatePath -Data $state

Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "## Lot auto $timestamp"
Add-Lines -Path $LotJournalPath -Lines @(
    "",
    "- Dry run : $DryRun",
    "- Branche : $branch",
    "- Statut checkpoint : $checkpointStatus",
    "- Commit : $commitHash",
    "- Action recommandee : $nextAction",
    "- Fichiers cibles :"
)
foreach ($file in $targetChanges) {
    Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "  - $file"
}

Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "## Lot checkpoint local $timestamp"
Add-Lines -Path $JournalPath -Lines @(
    "",
    "- Statut checkpoint : $checkpointStatus",
    "- Branche : $branch",
    "- Commit : $commitHash",
    "- Action recommandee : $nextAction"
)

Write-Output "[auto-checkpoint] Statut checkpoint : $checkpointStatus"
Write-Output "[auto-checkpoint] Branche : $branch"
Write-Output "[auto-checkpoint] Commit : $commitHash"
Write-Output "[auto-checkpoint] Action recommandee : $nextAction"
