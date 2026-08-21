# Stop SkillSync local processes started by scripts/start.ps1 (and any other
# listeners on the same ports). PostgreSQL is left running.

$ErrorActionPreference = "Continue"
$ports = 5173, 8080, 8081, 8082, 8083

Write-Host "Stopping SkillSync listeners on $($ports -join ', ')" -ForegroundColor Cyan

$pids = @()
foreach ($port in $ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            if ($c.OwningProcess) { $pids += $c.OwningProcess }
        }
    } catch { }
}

$pids = $pids | Sort-Object -Unique | Where-Object { $_ -and $_ -ne 0 }
if (-not $pids) {
    Write-Host "Nothing is listening on those ports."
    exit 0
}

foreach ($procId in $pids) {
    try {
        $proc = Get-Process -Id $procId -ErrorAction Stop
        Write-Host ("  stopping {0} (pid {1})" -f $proc.ProcessName, $procId)
        Stop-Process -Id $procId -Force -ErrorAction Stop
    } catch {
        Write-Host ("  could not stop pid {0}: {1}" -f $procId, $_.Exception.Message) -ForegroundColor Yellow
    }
}

Write-Host "Done. Close any leftover SkillSync PowerShell windows if they are still open."
