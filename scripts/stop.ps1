# Stop SkillSync local processes started by scripts/start.ps1 (and any other
# listeners on the same ports). PostgreSQL is left running.

$ErrorActionPreference = "Continue"
$ports = 5173, 8080, 8081, 8082, 8083, 8761

Write-Host "Stopping SkillSync listeners on $($ports -join ', ')" -ForegroundColor Cyan

function Get-ListeningPids([int] $Port) {
    $ids = @()
    $lines = netstat -ano -p TCP 2>$null
    foreach ($line in $lines) {
        if ($line -match "LISTENING" -and $line -match ":$Port\s+" -and $line -match "LISTENING\s+(\d+)\s*$") {
            $ids += [int] $Matches[1]
        }
    }
    return @($ids | Sort-Object -Unique | Where-Object { $_ -gt 0 })
}

$pids = @()
foreach ($port in $ports) {
    $pids += Get-ListeningPids $port
}
$pids = @($pids | Sort-Object -Unique)

if (-not $pids) {
    Write-Host "Nothing is listening on those ports."
    exit 0
}

foreach ($procId in $pids) {
    $name = "pid $procId"
    try {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc) { $name = "{0} (pid {1})" -f $proc.ProcessName, $procId }
    } catch { }
    Write-Host "  stopping $name"
    & taskkill.exe /PID $procId /T /F 2>$null | Out-Null
}

Start-Sleep -Seconds 1
$still = @()
foreach ($port in $ports) {
    $left = Get-ListeningPids $port
    if ($left) { $still += $port }
}
if ($still) {
    Write-Host ("Still listening on: {0}" -f ($still -join ", ")) -ForegroundColor Yellow
} else {
    Write-Host "Done. Close any leftover SkillSync PowerShell windows if they are still open."
}
