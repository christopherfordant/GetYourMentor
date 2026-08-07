param(
    [int]$MaxLots = 2,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$StatePath = Join-Path $Root "governance\ai\auto_mode_state.json"
$JournalPath = Join-Path $Root "governance\ai\auto_orchestrator_journal.md"
$BuildLotScript = Join-Path $PSScriptRoot "run_auto_build_supervision_lot.ps1"
$VisualLotScript = Join-Path $PSScriptRoot "run_auto_visual_audit_lot.ps1"
$CheckpointLotScript = Join-Path $PSScriptRoot "run_auto_git_checkpoint_lot.ps1"

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

function Ensure-Journal {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        Set-Content -LiteralPath $Path -Encoding UTF8 -Value "# Journal Orchestrateur Lots GYM`r`n"
    }
}

function Add-Entry {
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

function Get-NextLot {
    param([object]$State)
    if ($State.last_supervisor_status -ne "CONFORME") {
        return [pscustomobject]@{
            name = "stop"
            reason = "superviseur non conforme"
        }
    }
    if ($State.last_build_status -ne "OK") {
        return [pscustomobject]@{
            name = "build_supervision"
            reason = "build absent ou non OK"
        }
    }
    if ($State.last_visual_audit_status -ne "OK") {
        return [pscustomobject]@{
            name = "visual_audit"
            reason = "audit visuel absent ou non OK"
        }
    }
    if ($State.last_checkpoint_status -ne "CHECKPOINT_CREATED") {
        return [pscustomobject]@{
            name = "git_checkpoint_local"
            reason = "checkpoint local absent ou non cree"
        }
    }
    return [pscustomobject]@{
        name = "done"
        reason = "lots actuels deja conformes"
    }
}

function Invoke-Lot {
    param(
        [string]$LotName,
        [string]$ScriptPath
    )
    $output = powershell -ExecutionPolicy Bypass -File $ScriptPath 2>&1
    return [pscustomobject]@{
        name = $LotName
        output = $output
    }
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$state = Read-JsonFile -Path $StatePath
if ($null -eq $state) {
    throw "Etat auto projet introuvable."
}

$executedLots = @()
$decisions = @()
$chainStatus = "CHAIN_OK"

for ($i = 0; $i -lt $MaxLots; $i++) {
    $decision = Get-NextLot -State $state
    $decisions += "Decision $($i + 1): $($decision.name) - $($decision.reason)"

    if ($decision.name -eq "stop") {
        $chainStatus = "CHAIN_ALERT"
        break
    }
    if ($decision.name -eq "done") {
        break
    }
    if ($DryRun) {
        $executedLots += "[dry-run] $($decision.name)"
        break
    }

    switch ($decision.name) {
        "build_supervision" {
            $lot = Invoke-Lot -LotName "build_supervision" -ScriptPath $BuildLotScript
            $executedLots += $lot.name
        }
        "visual_audit" {
            $lot = Invoke-Lot -LotName "visual_audit" -ScriptPath $VisualLotScript
            $executedLots += $lot.name
        }
        "git_checkpoint_local" {
            $lot = Invoke-Lot -LotName "git_checkpoint_local" -ScriptPath $CheckpointLotScript
            $executedLots += $lot.name
        }
        default {
            $chainStatus = "CHAIN_ALERT"
            $decisions += "Lot inconnu rencontre: $($decision.name)"
            break
        }
    }

    $state = Read-JsonFile -Path $StatePath
    if ($null -eq $state) {
        throw "Etat auto projet introuvable apres le lot $($decision.name)."
    }

    if ($state.last_supervisor_status -ne "CONFORME") {
        $chainStatus = "CHAIN_ALERT"
        $decisions += "Arret chaine: superviseur non conforme apres $($decision.name)"
        break
    }
}

if ($executedLots.Count -eq 0 -and $chainStatus -eq "CHAIN_OK") {
    $chainStatus = "CHAIN_PARTIAL"
}

$state = Read-JsonFile -Path $StatePath
Set-StateValue -State $state -Name "last_orchestrator_run_at" -Value $timestamp
Set-StateValue -State $state -Name "last_orchestrator_status" -Value $chainStatus
Set-StateValue -State $state -Name "last_orchestrator_lots" -Value $executedLots
Set-StateValue -State $state -Name "last_orchestrator_decisions" -Value $decisions

$nextAction = if ($chainStatus -eq "CHAIN_ALERT") {
    "Traiter l'alerte de chaine avant de poursuivre"
} elseif ($state.last_build_status -eq "OK" -and $state.last_visual_audit_status -eq "OK" -and $state.last_checkpoint_status -eq "CHECKPOINT_CREATED") {
    "Preparer le prochain lot securise, par exemple un push GitHub cadre"
} else {
    "Relancer l'orchestrateur pour poursuivre les lots restants"
}
Set-StateValue -State $state -Name "next_recommended_action" -Value $nextAction

Write-JsonFile -Path $StatePath -Data $state

$lines = @(
    "Date : $timestamp",
    "Dry run : $DryRun",
    "Max lots : $MaxLots",
    "Statut chaine : $chainStatus",
    "Lots executes : $(([string]::Join(', ', $executedLots)))",
    "Action recommandee : $nextAction",
    "Decisions :"
)
$lines += $decisions

Add-Entry -Path $JournalPath -Title "Orchestrateur $timestamp" -Lines $lines

Write-Output "[orchestrator] Statut chaine : $chainStatus"
Write-Output "[orchestrator] Lots executes : $(([string]::Join(', ', $executedLots)))"
Write-Output "[orchestrator] Action recommandee : $nextAction"
