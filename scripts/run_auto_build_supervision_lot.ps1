$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$AutoCycleScript = Join-Path $PSScriptRoot "run_auto_project_cycle.ps1"
$StatePath = Join-Path $Root "governance\ai\auto_mode_state.json"
$JournalPath = Join-Path $Root "governance\ai\auto_mode_journal.md"
$LotJournalPath = Join-Path $Root "governance\ai\auto_build_supervision_journal.md"
$GymNextPath = Join-Path $Root "gym-next"

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

Ensure-FileWithHeader -Path $LotJournalPath -Header "# Journal Lot Auto Build + Supervision GYM`r`n"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$cycleOutput = powershell -ExecutionPolicy Bypass -File $AutoCycleScript 2>&1
$state = Read-JsonFile -Path $StatePath
if ($null -eq $state) {
    throw "Etat auto projet introuvable apres le cycle."
}

$supervisorStatus = [string]$state.last_supervisor_status
$buildStatus = "NON_LANCE"
$lotStatus = "ALERTE_SUPERVISEUR"
$buildOutput = @()

if ($supervisorStatus -eq "CONFORME") {
    Push-Location $GymNextPath
    try {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            $buildStatus = "OK"
            $lotStatus = "CONFORME_BUILD_OK"
        }
        else {
            $buildStatus = "KO"
            $lotStatus = "CONFORME_BUILD_KO"
        }
    }
    finally {
        Pop-Location
    }
}
else {
    $buildStatus = "NON_LANCE"
    $lotStatus = "ALERTE_SUPERVISEUR"
}

Set-StateValue -State $state -Name "last_build_status" -Value $buildStatus
Set-StateValue -State $state -Name "last_lot_status" -Value $lotStatus
Set-StateValue -State $state -Name "last_lot_at" -Value $timestamp
$nextAction = if ($lotStatus -eq "CONFORME_BUILD_OK") {
    "Continuer sur un lot metier ou un lot visuel sans casser la phase active $($state.active_phase)"
} elseif ($lotStatus -eq "CONFORME_BUILD_KO") {
    "Corriger le build Next.js avant toute progression"
} else {
    "Traiter les alertes du superviseur avant de relancer le build"
}
Set-StateValue -State $state -Name "next_recommended_action" -Value $nextAction

$notes = @()
if ($state.notes) {
    $notes += $state.notes
}
$notes += "Dernier lot auto build: $lotStatus"
Set-StateValue -State $state -Name "notes" -Value ($notes | Select-Object -Last 8)

Write-JsonFile -Path $StatePath -Data $state

Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "## Lot auto $timestamp"
Add-Lines -Path $LotJournalPath -Lines @(
    "",
    "- Statut superviseur : $supervisorStatus",
    "- Statut build : $buildStatus",
    "- Statut lot : $lotStatus",
    "- Phase active : $($state.active_phase)",
    "- Action recommandee : $nextAction",
    "",
    "### Sortie cycle auto"
)
foreach ($line in $cycleOutput) {
    Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "- $line"
}
Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "### Sortie build"
if ($buildOutput.Count -gt 0) {
    foreach ($line in $buildOutput) {
        Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "- $line"
    }
}
else {
    Add-Content -LiteralPath $LotJournalPath -Encoding UTF8 -Value "- build non lance"
}

Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "## Lot build + supervision $timestamp"
Add-Lines -Path $JournalPath -Lines @(
    "",
    "- Statut lot : $lotStatus",
    "- Statut build : $buildStatus",
    "- Action recommandee : $nextAction"
)

Write-Output "[auto-build] Lot termine."
Write-Output "[auto-build] Statut superviseur : $supervisorStatus"
Write-Output "[auto-build] Statut build : $buildStatus"
Write-Output "[auto-build] Statut lot : $lotStatus"
Write-Output "[auto-build] Action recommandee : $nextAction"
