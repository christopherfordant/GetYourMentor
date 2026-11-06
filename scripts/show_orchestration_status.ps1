param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -LiteralPath (Join-Path $root 'docs/architecture/orchestration-scripts-2026-11-06.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.version -ne 1) { throw 'Unknown inventory version.' }
$actual = @(Get-ChildItem -LiteralPath $PSScriptRoot -File | Where-Object { $_.Extension -in '.ps1','.py','.cjs','.cmd','.ahk' } | ForEach-Object { $_.Name })
$declared = @($manifest.scripts | ForEach-Object { $_.name })
if (@($declared | Select-Object -Unique).Count -ne $declared.Count) { throw 'Duplicate inventory entry.' }
$unknown = @($actual | Where-Object { $_ -cnotin $declared })
$missing = @($declared | Where-Object { $_ -cnotin $actual })
if ($unknown.Count -or $missing.Count) { throw 'Inventory stale: classify new or missing root scripts before use.' }
[pscustomobject]@{
    mode = 'inventory-only'
    executionVerified = $false
    runningProcessesInspected = $false
    filesWritten = $false
    scripts = $manifest.scripts
} | ConvertTo-Json -Depth 6
