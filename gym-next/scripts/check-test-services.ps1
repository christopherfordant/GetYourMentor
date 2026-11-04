$ErrorActionPreference='Stop'
$file=Join-Path $env:LOCALAPPDATA 'GetYourMentor-Test/services.clixml'
$values=@{}
if(Test-Path -LiteralPath $file){$values=Import-Clixml -LiteralPath $file}
$missing=@()
foreach($name in @('SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','SESSION_SECRET','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_CONNECT_COUNTRY','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','TELEGRAM_TEST_CHAT_IDS')){
 $present=$values.ContainsKey($name) -and $values[$name].Length -gt 0
 [pscustomobject]@{Setting=$name;Present=$present}
 if(!$present){$missing+=$name}
}
if($missing.Count){Write-Host 'Configuration incomplete. Utiliser configure-test-services.ps1, jamais la conversation.';exit 1}
Write-Host 'Champs presents seulement : validite externe, schema et reception non verifies.'
