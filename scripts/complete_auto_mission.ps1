param(
    [Parameter(Mandatory = $true)]
    [string]$MissionId,
    [Parameter(Mandatory = $true)]
    [string]$EvidencePath
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$StatePath = Join-Path $Root "governance\ai\auto_mode_state.json"
$RegistryPath = Join-Path $Root "governance\ai\mission_registry.json"
$ReportPath = Join-Path $Root "governance\ai\last_supervision_report.md"
$JournalPath = Join-Path $Root "governance\ai\auto_mission_planning_journal.md"
$SupervisorScript = Join-Path $PSScriptRoot "fil_rouge_supervisor.py"

function Read-JsonFile { param([string]$Path) return (Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json) }
function Write-JsonFile {
    param([string]$Path, [object]$Data)
    $directory = Split-Path -Parent $Path
    $fileName = Split-Path -Leaf $Path
    $tempPath = Join-Path $directory ("{0}.{1}.tmp" -f $fileName, [guid]::NewGuid().ToString("N"))
    $Data | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $tempPath -Encoding UTF8
    Move-Item -LiteralPath $tempPath -Destination $Path -Force
}
function Set-StateValue { param([object]$State, [string]$Name, [object]$Value)
    $property = $State.PSObject.Properties[$Name]
    if ($null -eq $property) { $State | Add-Member -NotePropertyName $Name -NotePropertyValue $Value }
    else { $property.Value = $Value }
}

$state = Read-JsonFile -Path $StatePath
$registry = Read-JsonFile -Path $RegistryPath
$mission = @($registry.missions | Where-Object { $_.id -eq $MissionId }) | Select-Object -First 1
if ($null -eq $mission) { throw "Mission inconnue : $MissionId" }
if ($state.last_mission_plan_status -ne "READY" -or $state.next_mission_id -ne $MissionId) {
    throw "La mission $MissionId n'est pas la mission READY courante."
}

$resolvedEvidence = if ([System.IO.Path]::IsPathRooted($EvidencePath)) { $EvidencePath } else { Join-Path $Root $EvidencePath }
if (-not (Test-Path -LiteralPath $resolvedEvidence)) { throw "Preuve introuvable : $resolvedEvidence" }

& python $SupervisorScript | Out-Null
$report = Get-Content -LiteralPath $ReportPath -Raw
if ($report -notmatch "STATUT : CONFORME") { throw "Superviseur non conforme : mission non cloturee." }

$order = @($registry.phase_order)
$index = [Array]::IndexOf($order, [string]$mission.phase)
$nextPhase = if ($index -ge 0 -and $index -lt ($order.Count - 1)) { $order[$index + 1] } else { $order[0] }
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Set-StateValue -State $state -Name "last_mission_plan_status" -Value "COMPLETED"
Set-StateValue -State $state -Name "completed_mission_id" -Value $MissionId
Set-StateValue -State $state -Name "completed_mission_at" -Value $timestamp
Set-StateValue -State $state -Name "completed_mission_evidence" -Value $EvidencePath
Set-StateValue -State $state -Name "active_phase" -Value $nextPhase
Set-StateValue -State $state -Name "next_recommended_action" -Value "Planifier la mission de la phase $nextPhase"
Write-JsonFile -Path $StatePath -Data $state

if (-not (Test-Path -LiteralPath $JournalPath)) { Set-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "# Journal Planification Missions GYM" }
Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value ""
Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "## Mission cloturee $timestamp"
Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "- Mission : $MissionId"
Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "- Preuve : $EvidencePath"
Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "- Superviseur : CONFORME"
Add-Content -LiteralPath $JournalPath -Encoding UTF8 -Value "- Phase suivante : $nextPhase"

Write-Output "[mission-complete] Mission cloturee : $MissionId"
Write-Output "[mission-complete] Phase suivante : $nextPhase"
