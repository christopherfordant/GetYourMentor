param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$MasterPath = Join-Path $Root "DOCUMENT_MAITRE_GYM.md"
$FilRougePath = Join-Path $Root "governance\FIL_ROUGE_OPERATOIRE_GYM.md"
$StatePath = Join-Path $Root "governance\ai\auto_mode_state.json"
$RegistryPath = Join-Path $Root "governance\ai\mission_registry.json"
$PlanPath = Join-Path $Root "governance\ai\NEXT_MISSION_GYM.md"
$JournalPath = Join-Path $Root "governance\ai\auto_mission_planning_journal.md"
$ReportPath = Join-Path $Root "governance\ai\last_supervision_report.md"
$SupervisorScript = Join-Path $PSScriptRoot "fil_rouge_supervisor.py"

function Read-JsonFile {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Write-JsonFile {
    param([string]$Path, [object]$Data)
    $directory = Split-Path -Parent $Path
    $fileName = Split-Path -Leaf $Path
    $tempPath = Join-Path $directory ("{0}.{1}.tmp" -f $fileName, [guid]::NewGuid().ToString("N"))
    $Data | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $tempPath -Encoding UTF8
    Move-Item -LiteralPath $tempPath -Destination $Path -Force
}

function Set-StateValue {
    param([object]$State, [string]$Name, [object]$Value)
    $property = $State.PSObject.Properties[$Name]
    if ($null -eq $property) { $State | Add-Member -NotePropertyName $Name -NotePropertyValue $Value }
    else { $property.Value = $Value }
}

function Add-JournalEntry {
    param([string[]]$Lines)
    if (-not (Test-Path -LiteralPath $JournalPath)) {
        Set-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "# Journal Planification Missions GYM"
    }
    Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value ""
    Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "## $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    foreach ($line in $Lines) { Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "- $line" }
}

foreach ($required in @($MasterPath, $FilRougePath, $StatePath, $RegistryPath, $ReportPath)) {
    if (-not (Test-Path -LiteralPath $required)) { throw "Document requis introuvable : $required" }
}

$master = Get-Content -LiteralPath $MasterPath -Raw
$filRouge = Get-Content -LiteralPath $FilRougePath -Raw
$state = Read-JsonFile -Path $StatePath
$registry = Read-JsonFile -Path $RegistryPath

if ($master -notmatch "Prochaines actions concretes" -or $master -notmatch "Prochaine etape du projet") {
    throw "Le document maitre ne contient pas les sections de pilotage attendues."
}
if ($filRouge -notmatch "MVP" -or $filRouge -notmatch "reservation") {
    throw "Le fil rouge ne contient pas les garde-fous MVP/reservation attendus."
}

& python $SupervisorScript | Out-Null
$report = Get-Content -LiteralPath $ReportPath -Raw
$supervisorStatus = if ($report -match "STATUT : CONFORME") { "CONFORME" } else { "ALERTE" }
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

if ($supervisorStatus -ne "CONFORME") {
    Set-StateValue -State $state -Name "last_mission_plan_status" -Value "BLOCKED_SUPERVISOR"
    Set-StateValue -State $state -Name "last_mission_plan_at" -Value $timestamp
    Set-StateValue -State $state -Name "next_mission_id" -Value $null
    Set-StateValue -State $state -Name "next_mission_title" -Value "Recadrer les alertes du superviseur"
    if (-not $DryRun) { Write-JsonFile -Path $StatePath -Data $state }
    Add-JournalEntry -Lines @("Statut : BLOCKED_SUPERVISOR", "Le fil rouge doit etre recadre avant toute mission.")
    Write-Output "[mission-planning] Statut : BLOCKED_SUPERVISOR"
    exit 2
}

$activePhase = [string]$state.active_phase
$mission = @($registry.missions | Where-Object { $_.phase -eq $activePhase }) | Select-Object -First 1
if ($null -eq $mission) { throw "Aucune mission cataloguee pour la phase $activePhase." }

$plan = @(
    "# Mission suivante GYM",
    "",
    "- Generee le : $timestamp",
    "- Statut superviseur : CONFORME",
    "- Phase active : $($mission.phase)",
    "- Mission : $($mission.id) - $($mission.title)",
    "- Objectif : $($mission.objective)",
    "- Gate d execution : $($mission.execution_gate)",
    "- Regle : aucune modification du code actif avant validation de cette mission.",
    "",
    "## Documents a relire",
    "",
    "- DOCUMENT_MAITRE_GYM.md",
    "- governance/FIL_ROUGE_OPERATOIRE_GYM.md"
)
foreach ($source in $mission.sources) { $plan += "- $source" }
$plan += @(
    "",
    "## Cadrage",
    "",
    "La source de verite reste le document maitre. Les prochaines actions concretes et la prochaine etape du projet doivent etre traitees avant toute extension du scope.",
    "",
    "## Etat de passage",
    "",
    "La mission est prete a etre executee par le role $($mission.phase). Elle doit produire une decision tracee, puis relancer le superviseur avant le lot suivant."
)

if (-not $DryRun) {
    Set-Content -LiteralPath $PlanPath -Value $plan -Encoding UTF8
    Set-StateValue -State $state -Name "last_mission_plan_status" -Value "READY"
    Set-StateValue -State $state -Name "last_mission_plan_at" -Value $timestamp
    Set-StateValue -State $state -Name "next_mission_id" -Value $mission.id
    Set-StateValue -State $state -Name "next_mission_phase" -Value $mission.phase
    Set-StateValue -State $state -Name "next_mission_title" -Value $mission.title
    Set-StateValue -State $state -Name "next_mission_gate" -Value $mission.execution_gate
    Set-StateValue -State $state -Name "next_mission_sources" -Value $mission.sources
    Write-JsonFile -Path $StatePath -Data $state
}

Add-JournalEntry -Lines @(
    "Statut : READY",
    "Mission : $($mission.id) - $($mission.title)",
    "Phase : $($mission.phase)",
    "Superviseur : CONFORME",
    "Dry run : $DryRun",
    "Aucune modification du code actif par ce lot."
)

Write-Output "[mission-planning] Statut : READY"
Write-Output "[mission-planning] Mission : $($mission.id) - $($mission.title)"
Write-Output "[mission-planning] Phase : $($mission.phase)"
