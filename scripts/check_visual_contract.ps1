param([switch]$Quiet)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$required = @(
  'docs/design/VISUAL_REFERENCE_CONTRACT.md',
  'docs/design/DESIGN_TOKENS.md',
  'docs/design/VISUAL_CHANGELOG.md',
  'docs/tests/VISUAL_ACCEPTANCE.md'
)
$missing = @($required | Where-Object { -not (Test-Path (Join-Path $root $_)) })
if ($missing.Count -gt 0) { throw "Contrat visuel incomplet: $($missing -join ', ')" }

$app = Join-Path $root 'gym-next'
$files = @(Get-ChildItem $app -Recurse -File -Include *.tsx,*.ts,*.css -ErrorAction SilentlyContinue | Where-Object {
  $_.FullName -notmatch '\\node_modules\\' -and
  $_.FullName -notmatch '\\.next\\' -and
  $_.FullName -notmatch '\\.netlify\\'
})
$forbidden = @()
foreach ($file in $files) {
  $content = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction SilentlyContinue
  $journey3d = ($file.Name -eq 'GsapJourneyScene.tsx' -and $content -match 'rotateY\s*:')
  if ($content -match 'preserve-3d|perspective\s*:' -or $journey3d) {
    $forbidden += $file.FullName.Substring($root.Length + 1)
  }
}
if ($forbidden.Count -gt 0) { throw "Transformation 3D interdite détectée dans: $($forbidden -join ', ')" }
if (-not $Quiet) { Write-Output "VISUAL_CONTRACT=OK"; Write-Output "3D_CAROUSEL=REMOVED" }
