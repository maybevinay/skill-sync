# SkillSync one-command local run.
# Usage (from repo root or anywhere):
#   powershell -ExecutionPolicy Bypass -File scripts/start.ps1
# Or double-click start.cmd in the repo root.

[CmdletBinding()]
param(
    [switch] $SkipFrontend,
    [switch] $SkipInstall,
    [switch] $NoBrowser
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Write-Step([string] $Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Test-Command([string] $Name) {
    return [bool] (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-PortOpen([int] $Port) {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        $ok = $iar.AsyncWaitHandle.WaitOne(400)
        if ($ok) { $client.EndConnect($iar) | Out-Null }
        $client.Close()
        return $ok
    } catch {
        return $false
    }
}

function Test-PortListening([int] $Port) {
    try {
        return [bool] (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
    } catch {
        return (Test-PortOpen $Port)
    }
}

function Import-DotEnv([string] $Path) {
    if (-not (Test-Path $Path)) { return }
    Get-Content -Path $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $eq = $line.IndexOf("=")
        if ($eq -lt 1) { return }
        $name = $line.Substring(0, $eq).Trim()
        $value = $line.Substring($eq + 1).Trim()
        if ($value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

function Wait-Health([string] $Url, [string] $Name, [int] $Seconds = 180) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $res = Invoke-RestMethod -Uri $Url -TimeoutSec 3
            if ($res.status -eq "UP") {
                Write-Host "    $Name is UP" -ForegroundColor Green
                return $true
            }
        } catch { }
        Start-Sleep -Seconds 3
    }
    Write-Host "    $Name did not become healthy at $Url" -ForegroundColor Yellow
    return $false
}

function Start-ServiceWindow([string] $Title, [string] $WorkingDir, [string] $Command) {
    $escapedDir = $WorkingDir.Replace("'", "''")
    $script = @"
Set-Location '$escapedDir'
`$Host.UI.RawUI.WindowTitle = '$Title'
Write-Host '$Title' -ForegroundColor Cyan
$Command
"@
    Start-Process -FilePath "powershell.exe" -WorkingDirectory $WorkingDir -ArgumentList @(
        "-NoExit",
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-Command", $script
    ) | Out-Null
}

Write-Host "SkillSync local startup" -ForegroundColor Magenta
Write-Host "Repo: $Root"

if (-not (Test-Path (Join-Path $Root ".env")) -and (Test-Path (Join-Path $Root ".env.example"))) {
    Copy-Item (Join-Path $Root ".env.example") (Join-Path $Root ".env")
    Write-Host "Created .env from .env.example. Add API keys there if you use AI/RAG." -ForegroundColor Yellow
}
Import-DotEnv (Join-Path $Root ".env")

Write-Step "Checking prerequisites"
foreach ($tool in @("java", "mvn", "node", "npm")) {
    if (-not (Test-Command $tool)) {
        throw "$tool is not on PATH. Install it, then run this script again. See docs/SETUP.md."
    }
}
Write-Host "    java, mvn, node, npm found"

if (-not (Test-PortOpen 5432)) {
    throw "PostgreSQL is not listening on localhost:5432. Start PostgreSQL first."
}
Write-Host "    PostgreSQL port 5432 is open"

$pgUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } elseif ($env:DB_USERNAME) { $env:DB_USERNAME } else { "root" }
$pgPass = if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } elseif ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" }
$pgHost = if ($env:POSTGRES_HOST) { $env:POSTGRES_HOST } else { "localhost" }
$pgPort = if ($env:POSTGRES_PORT) { $env:POSTGRES_PORT } else { "5432" }

if (Test-Command "psql") {
    Write-Step "Ensuring databases exist"
    $env:PGPASSWORD = $pgPass
    foreach ($db in @("skillsync_auth", "skillsync_matching", "skillsync_ai")) {
        $exists = & psql -h $pgHost -p $pgPort -U $pgUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" 2>$null
        if ("$exists".Trim() -eq "1") {
            Write-Host "    $db already exists"
        } else {
            & psql -h $pgHost -p $pgPort -U $pgUser -d postgres -c "CREATE DATABASE $db" | Out-Null
            Write-Host "    created $db"
        }
    }
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
} else {
    Write-Host "    psql not on PATH; skipping database create. Databases must already exist." -ForegroundColor Yellow
}

$frontendDir = Join-Path $Root "frontend-react"
if (-not $SkipFrontend -and -not $SkipInstall -and -not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Step "Installing frontend dependencies"
    Push-Location $frontendDir
    npm install
    Pop-Location
}

$services = @(
    @{ Name = "auth-service";     Port = 8081; Dir = "backend\auth-service";     Health = "http://localhost:8081/actuator/health"; Cmd = "mvn spring-boot:run" }
    @{ Name = "matching-service"; Port = 8082; Dir = "backend\matching-service"; Health = "http://localhost:8082/actuator/health"; Cmd = "mvn spring-boot:run" }
    @{ Name = "ai-service";       Port = 8083; Dir = "backend\ai-service";       Health = "http://localhost:8083/actuator/health"; Cmd = "mvn spring-boot:run" }
    @{ Name = "api-gateway";      Port = 8080; Dir = "backend\api-gateway";      Health = "http://localhost:8080/actuator/health"; Cmd = "mvn spring-boot:run" }
)

Write-Step "Starting backend services (each in its own window)"
foreach ($svc in $services) {
    if (Test-PortListening $svc.Port) {
        Write-Host "    $($svc.Name) already listening on $($svc.Port) — skipping" -ForegroundColor Yellow
        continue
    }
    $dir = Join-Path $Root $svc.Dir
    Start-ServiceWindow "SkillSync $($svc.Name)" $dir $svc.Cmd
    Write-Host "    launched $($svc.Name)"
}

Write-Step "Waiting for backends to become healthy (first Maven run can take a few minutes)"
$allUp = $true
foreach ($svc in $services) {
    if (-not (Wait-Health $svc.Health $svc.Name 180)) { $allUp = $false }
}
if (-not $allUp) {
    Write-Host "One or more backends are not healthy. Check the service windows for errors." -ForegroundColor Yellow
}

if (-not $SkipFrontend) {
    Write-Step "Starting frontend"
    if (Test-PortListening 5173) {
        Write-Host "    Vite already listening on 5173 — skipping" -ForegroundColor Yellow
    } else {
        Start-ServiceWindow "SkillSync frontend" $frontendDir "npm run dev"
        Write-Host "    launched frontend"
        $deadline = (Get-Date).AddSeconds(60)
        while ((Get-Date) -lt $deadline -and -not (Test-PortListening 5173)) {
            Start-Sleep -Seconds 2
        }
        if (Test-PortListening 5173) {
            Write-Host "    frontend is up on http://localhost:5173" -ForegroundColor Green
        } else {
            Write-Host "    frontend did not bind 5173 yet. Check the frontend window." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "SkillSync URLs" -ForegroundColor Magenta
Write-Host "  App:      http://localhost:5173"
Write-Host "  Gateway:  http://localhost:8080/actuator/health"
Write-Host "  Auth:     http://localhost:8081/swagger-ui.html"
Write-Host "  Matching: http://localhost:8082/swagger-ui.html"
Write-Host "  AI:       http://localhost:8083/swagger-ui.html"
Write-Host ""
Write-Host "Demo logins (see docs/SETUP.md)"
Write-Host "  user@skillsync.dev"
Write-Host "  mentor@skillsync.dev"
Write-Host "  admin@skillsync.dev"
Write-Host ""
Write-Host "Stop everything:  powershell -ExecutionPolicy Bypass -File scripts\stop.ps1"

if (-not $NoBrowser -and -not $SkipFrontend) {
    Start-Process "http://localhost:5173"
}
