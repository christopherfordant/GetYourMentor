$ErrorActionPreference = 'Stop'
$file = Join-Path $env:LOCALAPPDATA 'GetYourMentor-Test/services.clixml'
if (!(Test-Path -LiteralPath $file)) { throw 'Executer configure-test-services.ps1 en premier.' }
$values = Import-Clixml -LiteralPath $file
$keys = @('STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','GYM_REAL_TEST_SERVICES')
$previous = @{}
foreach ($name in $keys) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
try {
 foreach ($name in $keys) {
  if ($values.ContainsKey($name)) { [Environment]::SetEnvironmentVariable($name,[System.Net.NetworkCredential]::new('', $values[$name]).Password,'Process') }
 }
 if ($env:STRIPE_SECRET_KEY -notmatch '^(sk|rk)_test_[A-Za-z0-9]+$') { throw 'Cle de test Stripe requise.' }
 $env:GYM_REAL_TEST_SERVICES='true'
 $launcher=Join-Path $PSScriptRoot 'run-test-preview.cjs'
 if (!(Test-Path -LiteralPath $launcher)) { throw 'Lanceur local absent. Consulter le compte rendu.' }
 & node $launcher
} finally {
 foreach ($name in $keys) { [Environment]::SetEnvironmentVariable($name,$previous[$name],'Process') }
}
