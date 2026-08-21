# Load repo-root .env into the current process. Dot-source from start.ps1
# and from each SkillSync service window.
$SkillSyncRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $SkillSyncRoot ".env"
if (-not (Test-Path $envFile)) { return }
Get-Content -Path $envFile | ForEach-Object {
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
