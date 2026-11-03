$ErrorActionPreference = 'Stop'
# Windows DPAPI: readable only by this Windows user on this machine.
$privateDir = Join-Path $env:LOCALAPPDATA 'GetYourMentor-Test'
New-Item -ItemType Directory -Path $privateDir -Force | Out-Null
$file = Join-Path $privateDir 'services.clixml'
$values = @{}
if (Test-Path -LiteralPath $file) { $values = Import-Clixml -LiteralPath $file }
Write-Host 'Saisie locale masquee. Entree conserve une valeur existante. Ne saisir que des acces de TEST.'
foreach ($name in @('STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET')) {
  $secure = Read-Host $name -AsSecureString
  if ($secure.Length -eq 0) { continue }
  $plain = [System.Net.NetworkCredential]::new('', $secure).Password
  if ($name -eq 'STRIPE_SECRET_KEY' -and $plain -notmatch '^(sk|rk)_test_[A-Za-z0-9]+$') { throw 'Cle Stripe refusee : test uniquement.' }
  if ($name -eq 'TELEGRAM_WEBHOOK_SECRET' -and $plain -notmatch '^[A-Za-z0-9_-]{32,256}$') { throw 'Secret webhook Telegram : 32 a 256 caracteres lettres, chiffres, tirets.' }
  $values[$name] = $secure
  $plain = $null
}
$values | Export-Clixml -LiteralPath $file
Write-Host 'Acces enregistres avec chiffrement Windows hors du depot. Aucune cle affichee.'
