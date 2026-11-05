param([ValidateSet('legacy-test','recipe-accounts-v2')][string]$StripeEnvironment='legacy-test')
$ErrorActionPreference = 'Stop'
$vaultName=if($StripeEnvironment -eq 'legacy-test'){'services.clixml'}else{'services-sandbox.clixml'}
$file = Join-Path (Join-Path $env:LOCALAPPDATA 'GetYourMentor-Test') $vaultName
if (!(Test-Path -LiteralPath $file)) { throw 'Executer configure-test-services.ps1 en premier.' }
$values = Import-Clixml -LiteralPath $file
$keys = @('SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','SESSION_SECRET','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_CONNECT_COUNTRY','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','TELEGRAM_TEST_CHAT_IDS','GYM_REAL_TEST_SERVICES','RECIPE_COACH_APPROVAL','STRIPE_ENVIRONMENT_ID')
$previous = @{}
foreach ($name in $keys) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
try {
 foreach ($name in $keys) {
  if ($values.ContainsKey($name)) { [Environment]::SetEnvironmentVariable($name,[System.Net.NetworkCredential]::new('', $values[$name]).Password,'Process') }
 }
 if ($env:STRIPE_SECRET_KEY -notmatch '^(sk|rk)_test_[A-Za-z0-9]+$') { throw 'Cle de test Stripe requise.' }
 if ($env:SUPABASE_URL -ne 'https://pqxqqbwesfrefzjoawmx.supabase.co') { throw 'Projet Supabase de recette requis.' }
 foreach($name in $keys | Where-Object { $_ -notin @('GYM_REAL_TEST_SERVICES','RECIPE_COACH_APPROVAL','STRIPE_ENVIRONMENT_ID') }) {
  if (![Environment]::GetEnvironmentVariable($name,'Process')) { throw "Configuration locale manquante : $name" }
 }
 $env:STRIPE_ENVIRONMENT_ID=$StripeEnvironment
 $expected=if($StripeEnvironment -eq 'legacy-test'){'acct_1UGhVXPwRppadkVH'}else{'acct_1UYN06LfnWg4ERQJ'}
 try {$platform=Invoke-RestMethod -Uri 'https://api.stripe.com/v1/account' -Headers @{Authorization="Bearer $env:STRIPE_SECRET_KEY"};if($platform.id -ne $expected){throw 'mismatch'}}catch{throw 'Cle et plateforme Stripe incompatibles; lancement refuse'}
 $env:GYM_REAL_TEST_SERVICES='true'
 $launcher=Join-Path $PSScriptRoot 'run-test-preview.cjs'
 if (!(Test-Path -LiteralPath $launcher)) { throw 'Lanceur local absent. Consulter le compte rendu.' }
 & node $launcher
} finally {
 foreach ($name in $keys) { [Environment]::SetEnvironmentVariable($name,$previous[$name],'Process') }
}
