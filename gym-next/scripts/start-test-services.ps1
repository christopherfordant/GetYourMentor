$ErrorActionPreference = 'Stop'
$file = Join-Path $env:LOCALAPPDATA 'GetYourMentor-Test/services.clixml'
if (!(Test-Path -LiteralPath $file)) { throw 'Executer configure-test-services.ps1 en premier.' }
$values = Import-Clixml -LiteralPath $file
$keys = @('SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','SESSION_SECRET','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_CONNECT_COUNTRY','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','TELEGRAM_TEST_CHAT_IDS','GYM_REAL_TEST_SERVICES','RECIPE_COACH_APPROVAL')
$previous = @{}
foreach ($name in $keys) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
try {
 foreach ($name in $keys) {
  if ($values.ContainsKey($name)) { [Environment]::SetEnvironmentVariable($name,[System.Net.NetworkCredential]::new('', $values[$name]).Password,'Process') }
 }
 if ($env:STRIPE_SECRET_KEY -notmatch '^(sk|rk)_test_[A-Za-z0-9]+$') { throw 'Cle de test Stripe requise.' }
 if ($env:SUPABASE_URL -ne 'https://pqxqqbwesfrefzjoawmx.supabase.co') { throw 'Projet Supabase de recette requis.' }
 foreach($name in $keys | Where-Object { $_ -notin @('GYM_REAL_TEST_SERVICES','RECIPE_COACH_APPROVAL') }) {
  if (![Environment]::GetEnvironmentVariable($name,'Process')) { throw "Configuration locale manquante : $name" }
 }
 $env:GYM_REAL_TEST_SERVICES='true'
 $launcher=Join-Path $PSScriptRoot 'run-test-preview.cjs'
 if (!(Test-Path -LiteralPath $launcher)) { throw 'Lanceur local absent. Consulter le compte rendu.' }
 & node $launcher
} finally {
 foreach ($name in $keys) { [Environment]::SetEnvironmentVariable($name,$previous[$name],'Process') }
}
