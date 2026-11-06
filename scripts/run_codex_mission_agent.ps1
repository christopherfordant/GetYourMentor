param(
    [string]$MissionId = "CTO-001",
    [switch]$DryRun
)

# Legacy entry: inspect before any state, executable, log or process access.
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'orchestration_gate.ps1') -EntryPoint 'run_codex_mission_agent.ps1' -DryRun:$DryRun
if ($DryRun) { return }


$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$StatePath = Join-Path $Root "governance\ai\auto_mode_state.json"
$PlanPath = Join-Path $Root "governance\ai\NEXT_MISSION_GYM.md"
$ContractPath = Join-Path $Root "governance\ai\AGENT_MISSION_EXECUTION_PROMPT.md"
$EvidenceDirectory = Join-Path $Root "governance\ai\mission_evidence"
$EvidencePath = Join-Path $EvidenceDirectory "$MissionId.md"
$LogDirectory = Join-Path $Root "governance\ai\agent_runs"
$LogPath = Join-Path $LogDirectory ("{0}_{1}.log" -f $MissionId, (Get-Date -Format "yyyyMMdd_HHmmss"))
$CompleteScript = Join-Path $PSScriptRoot "complete_auto_mission.ps1"

if (-not (Test-Path -LiteralPath $StatePath) -or -not (Test-Path -LiteralPath $PlanPath) -or -not (Test-Path -LiteralPath $ContractPath)) {
    throw "Contexte agent incomplet."
}
$state = Get-Content -LiteralPath $StatePath -Raw | ConvertFrom-Json
if ($state.last_mission_plan_status -ne "READY" -or $state.next_mission_id -ne $MissionId) {
    throw "La mission $MissionId n'est pas READY dans le RAG."
}

$codex = (Get-Command codex.exe -ErrorAction Stop).Source
$prompt = @(
    (Get-Content -LiteralPath $ContractPath -Raw),
    "`n## Mission active`n",
    (Get-Content -LiteralPath $PlanPath -Raw),
    "`n## Consigne finale`nExecute cette mission dans le workspace $Root. Reste sur la branche courante. N attends pas une nouvelle mission et n execute aucune autre phase."
) -join "`n"

if (-not (Test-Path -LiteralPath $LogDirectory)) { New-Item -ItemType Directory -Path $LogDirectory | Out-Null }
if (-not (Test-Path -LiteralPath $EvidenceDirectory)) { New-Item -ItemType Directory -Path $EvidenceDirectory | Out-Null }

if ($DryRun) {
    Write-Output "[agent] Dry run : Codex disponible ($codex)"
    Write-Output "[agent] Mission : $MissionId"
    Write-Output "[agent] Preuve attendue : $EvidencePath"
    exit 0
}

$doctorOutput = (& $codex doctor 2>&1 | Out-String)
if ($doctorOutput -match "no Codex credentials were found" -or $doctorOutput -match "no Codex credentials") {
    throw "Agent indisponible : aucun identifiant Codex n'est configure. La mission reste READY."
}

$prompt | & $codex exec -C $Root -s workspace-write - 2>&1 | Tee-Object -FilePath $LogPath
if ($LASTEXITCODE -ne 0) {
    throw "L agent Codex s est arrete avec le code $LASTEXITCODE. Voir $LogPath"
}
if (-not (Test-Path -LiteralPath $EvidencePath)) {
    throw "Preuve agent absente : $EvidencePath"
}

powershell -ExecutionPolicy Bypass -File $CompleteScript -MissionId $MissionId -EvidencePath (Join-Path "governance\ai\mission_evidence" "$MissionId.md")
Write-Output "[agent] Mission executee et cloturee : $MissionId"
