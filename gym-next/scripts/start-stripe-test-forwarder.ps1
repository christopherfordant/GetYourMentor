$ErrorActionPreference='Stop'
$dir=Join-Path $env:LOCALAPPDATA 'GetYourMentor-Test'
$file=Join-Path $dir 'services.clixml'
$exe=Join-Path $dir 'tools/stripe-1.55.8/stripe.exe'
if(!(Test-Path -LiteralPath $file) -or !(Test-Path -LiteralPath $exe)){throw 'Configuration locale ou Stripe CLI absent'}
$values=Import-Clixml -LiteralPath $file
if(!$values.ContainsKey('STRIPE_SECRET_KEY') -or !$values.ContainsKey('STRIPE_WEBHOOK_SECRET')){throw 'Acces Stripe test incomplets'}
$key=[Net.NetworkCredential]::new('',$values['STRIPE_SECRET_KEY']).Password
if($key -notmatch '^(sk|rk)_test_[A-Za-z0-9]+$'){throw 'Stripe test uniquement'}
$previous=[Environment]::GetEnvironmentVariable('STRIPE_API_KEY','Process')
$expected=[Net.NetworkCredential]::new('',$values['STRIPE_WEBHOOK_SECRET']).Password
try{
 $env:STRIPE_API_KEY=$key
 $key=$null
 Write-Host 'Transfert Stripe TEST vers 127.0.0.1:3005. Aucun secret ni payload journalise.'
 # Native stderr is merged and filtered before any display; never tee raw output.
 $ErrorActionPreference='Continue'
 & $exe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to http://127.0.0.1:3005/api/webhooks/stripe 2>&1 | ForEach-Object {
  $line=$_.ToString()
  if($line -match 'whsec_[A-Za-z0-9]+'){
   if($Matches[0] -cne $expected){throw 'Secret de reception different du coffre. Arreter et reconfigurer avant tout essai.'}
   Write-Host 'Reception Stripe test prete; secret concordant avec le coffre.'
  }elseif($line -match '\[([245][0-9][0-9])\]'){
   Write-Host ('Reponse du serveur local : HTTP '+$Matches[1])
  }
 }
 if($LASTEXITCODE -ne 0){throw 'Transfert Stripe interrompu; verifier sa disponibilite avant tout paiement test'}
}finally{
 [Environment]::SetEnvironmentVariable('STRIPE_API_KEY',$previous,'Process')
 $expected=$null
 $ErrorActionPreference='Stop'
}
