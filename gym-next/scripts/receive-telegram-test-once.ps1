$ErrorActionPreference = 'Stop'
# Bounded recipe receiver: forwards only the exact pending coach1 challenge.
# Never advances Telegram's offset, deletes a webhook, or logs update contents.
$folder = Join-Path $env:LOCALAPPDATA 'GetYourMentor-Test'
$stage = 'configuration'
try {
 $vault = Import-Clixml (Join-Path $folder 'services.clixml')
 $accounts = Import-Clixml (Join-Path $folder 'recipe-accounts.clixml')
 $token = [Net.NetworkCredential]::new('', $vault['TELEGRAM_BOT_TOKEN']).Password
 $chat = [Net.NetworkCredential]::new('', $vault['TELEGRAM_TEST_CHAT_IDS']).Password
 $secret = [Net.NetworkCredential]::new('', $vault['TELEGRAM_WEBHOOK_SECRET']).Password
 $command = [Net.NetworkCredential]::new('', $accounts['coach1-telegram-command']).Password
 if ($command -notmatch '^/start [A-Za-z0-9_-]{32}$' -or $chat -notmatch '^\d+$') { throw 'Invalid recipe configuration' }
 $stage = 'bot-identity'
 $me = Invoke-RestMethod -Uri ('https://api.telegram.org/bot'+$token+'/getMe') -TimeoutSec 15
 if (!$me.ok -or $me.result.username -ne 'Christopherfordantbot') { throw 'Unexpected bot' }
 $stage = 'existing-webhook'
 $hook = Invoke-RestMethod -Uri ('https://api.telegram.org/bot'+$token+'/getWebhookInfo') -TimeoutSec 15
 if (!$hook.ok -or $hook.result.url) { throw 'Preserve existing webhook' }
 $stage = 'receive'
 $updates = Invoke-RestMethod -Uri ('https://api.telegram.org/bot'+$token+'/getUpdates?timeout=0') -TimeoutSec 15
 if (!$updates.ok) { throw 'Updates unavailable' }
 $matched = @($updates.result | Where-Object { $_.message.text -ceq $command -and $_.message.chat.type -eq 'private' -and [string]$_.message.chat.id -eq $chat -and $_.message.from.id -eq $_.message.chat.id })
 if ($matched.Count -ne 1) { throw 'Unique expected challenge not received' }
 $stage = 'signed-local-reception'
 $payload = $matched[0] | ConvertTo-Json -Depth 12 -Compress
 $received = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:3005/api/webhooks/telegram' -Headers @{'x-telegram-bot-api-secret-token'=$secret} -ContentType 'application/json' -Body ([Text.Encoding]::UTF8.GetBytes($payload)) -TimeoutSec 15
 if (!$received.ok) { throw 'Local reception refused' }
 [pscustomobject]@{received=$true;matchingPrivateChallenge=$true;offsetAdvanced=$false;webhookModified=$false} | ConvertTo-Json -Compress
} catch {
 [pscustomobject]@{received=$false;stage=$stage;detailsLogged=$false} | ConvertTo-Json -Compress
 exit 1
} finally {
 $token=$null; $chat=$null; $secret=$null; $command=$null; $payload=$null; $updates=$null
}
