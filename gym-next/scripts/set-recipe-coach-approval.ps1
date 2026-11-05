param([switch]$Revoke)
$ErrorActionPreference='Stop'
$folder=Join-Path $env:LOCALAPPDATA 'GetYourMentor-Test'
$file=Join-Path $folder 'services.clixml'
$v=Import-Clixml $file
$stage='configuration'
try{
 $url=[Net.NetworkCredential]::new('',$v['SUPABASE_URL']).Password
 if($url -ne 'https://pqxqqbwesfrefzjoawmx.supabase.co'){throw 'Wrong project'}
 $key=[Net.NetworkCredential]::new('',$v['SUPABASE_SERVICE_ROLE_KEY']).Password
 $stage='target-identity'
 $users=Invoke-RestMethod -Uri ($url+'/auth/v1/admin/users?page=1&per_page=100') -Headers @{apikey=$key;Authorization=('Bearer '+$key)} -TimeoutSec 15
 $user=@($users.users|Where-Object{$_.email -eq 'christopherfordant1+gymcoach1-20261104@gmail.com'})
 if($user.Count -ne 1 -or !$user[0].email_confirmed_at -or $user[0].app_metadata.role -ne 'coach'){throw 'Target not confirmed coach'}
 $id=$user[0].app_metadata.coach_id
 if($id -notmatch '^coach-[a-f0-9-]{36}$'){throw 'Invalid target identity'}
 $profile=Invoke-RestMethod -Uri ($url+'/rest/v1/gym_coaches?id=eq.'+$id+'&select=id,name,verified,verification_status,diplomas') -Headers @{apikey=$key;Authorization=('Bearer '+$key)} -TimeoutSec 15
 if(@($profile).Count -ne 1 -or $profile[0].verified -or $profile[0].name -notmatch '^Demo ' -or $profile[0].diplomas){throw 'Target must be an unverified demonstration profile without qualifications'}
 $now=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
 $a=@{version=1;project='pqxqqbwesfrefzjoawmx';coachId=$id;actor=[Security.Principal.WindowsIdentity]::GetCurrent().Name;issuedAt=$now;expiresAt=($now+3600000);action=$(if($Revoke){'revoke'}else{'approve'})}
 $json=$a|ConvertTo-Json -Compress
 if($Revoke){$v.Remove('RECIPE_COACH_APPROVAL')}else{$v['RECIPE_COACH_APPROVAL']=ConvertTo-SecureString $json -AsPlainText -Force}
 $v|Export-Clixml $file
 Add-Content -LiteralPath (Join-Path $folder 'recipe-approval-audit.jsonl') -Value $json -Encoding UTF8
 # Stop only the recognized local recipe listener: revocation must not leave
 # a previously loaded capability active. Restart with start-test-services.ps1.
 $listeners=Get-NetTCPConnection -LocalPort 3005 -State Listen -ErrorAction SilentlyContinue
 foreach($listener in $listeners){
  $proc=Get-CimInstance Win32_Process -Filter ('ProcessId='+$listener.OwningProcess)
  if($proc.Name -eq 'node.exe' -and $proc.CommandLine -match 'next start --hostname 127.0.0.1 --port 3005'){Stop-Process -Id $listener.OwningProcess}
  else{throw 'Unrecognized listener; stop manually before restart'}
 }
 [pscustomobject]@{configured=$true;revoked=[bool]$Revoke;professionalVerificationChanged=$false;restartRequired=$true}|ConvertTo-Json -Compress
}catch{[pscustomobject]@{configured=$false;stage=$stage;detailsLogged=$false}|ConvertTo-Json -Compress;exit 1}
finally{$key=$null}
