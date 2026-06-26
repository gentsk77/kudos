# win-task.ps1 - register the Kudos snapshot as a Windows scheduled task.
# Called by /kudos:setup on Windows. Points the task at the stable ~/.kudos/bin copy,
# so plugin updates never break it. Re-run to refresh times.
param(
  [string]$DataHome = (Join-Path $env:USERPROFILE '.kudos'),
  [string[]]$Times = @('12:00', '18:00', '23:55')
)
$ErrorActionPreference = 'Stop'

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { Write-Error 'node not found on PATH. Install Node.js, then re-run /kudos:setup.'; exit 1 }

$script   = Join-Path $DataHome 'bin\snapshot.mjs'
$launcher = Join-Path $DataHome 'bin\run-snapshot.cmd'
"@echo off`r`nset KUDOS_HOME=$DataHome`r`n`"$node`" `"$script`"" | Set-Content -Path $launcher -Encoding ascii

$action    = New-ScheduledTaskAction -Execute $launcher
$triggers  = $Times | ForEach-Object { New-ScheduledTaskTrigger -Daily -At $_ }
$settings  = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries `
              -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName 'Kudos-Snapshot' -Action $action -Trigger $triggers `
  -Settings $settings -Principal $principal -Force `
  -Description 'Kudos working-tree snapshots (no AI, no network).' | Out-Null

Write-Host "Registered 'Kudos-Snapshot' to run daily at: $($Times -join ', ')  (home: $DataHome)"
