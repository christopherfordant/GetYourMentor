$ErrorActionPreference = 'Stop'
# Windows DPAPI: readable only by this Windows user on this machine.
$privateDir = Join-Path $env:LOCALAPPDATA 'GetYourMentor-Test'
New-Item -ItemType Directory -Path $privateDir -Force | Out-Null
$file = Join-Path $privateDir 'services.clixml'
$values = @{}
if (Test-Path -LiteralPath $file) { $values = Import-Clixml -LiteralPath $file }
Write-Host 'Saisie locale masquee. Entree conserve une valeur existante. Ne saisir que des acces de TEST.'
Write-Host 'Supabase : uniquement le projet de recette pqxqqbwesfrefzjoawmx. Aucun secret dans la conversation.'
foreach ($name in @('SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_CONNECT_COUNTRY','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','TELEGRAM_TEST_CHAT_IDS')) {
  $secure = Read-Host $name -AsSecureString
  if ($secure.Length -eq 0) { continue }
  $plain = [System.Net.NetworkCredential]::new('', $secure).Password
  if ($name -eq 'STRIPE_SECRET_KEY' -and $plain -notmatch '^(sk|rk)_test_[A-Za-z0-9]+$') { throw 'Cle Stripe refusee : test uniquement.' }
  if ($name -eq 'SUPABASE_URL' -and $plain -ne 'https://pqxqqbwesfrefzjoawmx.supabase.co') { throw 'Seul le projet Supabase de recette identifie est autorise.' }
  if ($name -eq 'STRIPE_CONNECT_COUNTRY' -and $plain -notmatch '^[A-Z]{2}$') { throw 'Pays du compte Connect de test : code ISO de deux lettres majuscules.' }
  if ($name -eq 'TELEGRAM_TEST_CHAT_IDS' -and $plain -notmatch '^[1-9][0-9]{0,15}$') { throw 'Une seule conversation Telegram privee positive pour cette recette.' }
  if ($name -eq 'TELEGRAM_WEBHOOK_SECRET' -and $plain -notmatch '^[A-Za-z0-9_-]{32,256}$') { throw 'Secret webhook Telegram : 32 a 256 caracteres lettres, chiffres, tirets.' }
  $values[$name] = $secure
  $plain = $null
}
foreach ($name in @('SESSION_SECRET','TELEGRAM_WEBHOOK_SECRET')) {
 if (!$values.ContainsKey($name)) {
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  $generated = -join ($bytes | ForEach-Object { $_.ToString('x2') })
  $values[$name] = ConvertTo-SecureString $generated -AsPlainText -Force
  $generated = $null
 }
}
$values | Export-Clixml -LiteralPath $file
Write-Host 'Acces enregistres avec chiffrement Windows hors du depot. Aucune cle affichee.'
