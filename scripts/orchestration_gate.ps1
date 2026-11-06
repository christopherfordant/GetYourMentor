param(
    [Parameter(Mandatory = $true)][string]$EntryPoint,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$manifestPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'docs/architecture/orchestration-scripts-2026-11-06.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$entry = @($manifest.scripts | Where-Object { $_.name -ceq $EntryPoint })
if ($manifest.version -ne 1 -or $entry.Count -ne 1 -or $entry[0].classification -ne 'historical-disabled') {
    throw 'ORCHESTRATION_POLICY_REFUSED: missing, unknown or inconsistent entry.'
}
if ($DryRun) {
    [pscustomobject]@{
        entryPoint = $EntryPoint
        classification = 'historical-disabled'
        mode = 'preview-only'
        executable = $false
        agentStarted = $false
        stateRead = $false
        filesWritten = $false
        reason = 'Current policy: one supervised lot, no additional agent or unattended loop.'
    } | ConvertTo-Json -Compress
    return
}
throw 'ORCHESTRATION_POLICY_REFUSED: historical execution disabled. Use -DryRun for a read-only descriptor. A READY state is not authorization.'
