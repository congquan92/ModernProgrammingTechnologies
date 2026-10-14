param([switch]$RuntimeOnly)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $repoRoot
$evidenceDir = Join-Path $repoRoot 'baocao/evidence'
New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null

if ($env:TMDB_BASE_URL -like 'http://127.0.0.1:4100*') {
    throw 'Dang dung TMDB mock. Mo PowerShell moi de thu bang API TMDB that.'
}

$gitHead = (& git rev-parse --short HEAD).Trim()
$workingTreeDirty = [bool](@(& git status --porcelain).Count)

function Invoke-EvidenceCommand {
    param(
        [string]$FileName,
        [string]$DisplayCommand,
        [string]$Executable,
        [string[]]$Arguments
    )

    $logPath = Join-Path $evidenceDir $FileName
    @(
        "generated_at: $(Get-Date -Format o)"
        "git_head: $gitHead"
        "working_tree_dirty: $workingTreeDirty"
        "command: $DisplayCommand"
    ) | Set-Content -LiteralPath $logPath -Encoding utf8
    Write-Host ">>> $DisplayCommand"

    & $Executable @Arguments 2>&1 | ForEach-Object {
        $line = ([string]$_) -replace '(?i)api_key=[^\s&]+', 'api_key=[REDACTED]'
        Write-Host $line
        Add-Content -LiteralPath $logPath -Value $line -Encoding utf8
    }
    $exitCode = $LASTEXITCODE
    "exit_code: $exitCode" | Add-Content -LiteralPath $logPath -Encoding utf8
    if ($exitCode -ne 0) { throw "$DisplayCommand failed (exit $exitCode). See $logPath" }
    Write-Host "Saved: $logPath"
}

if ($RuntimeOnly) {
    if (-not (Test-Path -LiteralPath '.next/server/app/index.html')) {
        throw 'Chua co production build. Chay .\scripts\refresh-evidence.ps1 truoc.'
    }
    Invoke-EvidenceCommand 'runtime-http.txt' 'python scripts/verify-runtime-http.py' 'python' @('scripts/verify-runtime-http.py')
    return
}

Invoke-EvidenceCommand 'lint-output.txt' 'npm run lint' 'npm.cmd' @('run', 'lint')
Invoke-EvidenceCommand 'typecheck-output.txt' 'npx tsc --noEmit' 'npx.cmd' @('tsc', '--noEmit')
Invoke-EvidenceCommand 'test-output.txt' 'npm test' 'npm.cmd' @('test')
Invoke-EvidenceCommand 'build-output.txt' 'npm run build' 'npm.cmd' @('run', 'build')
Invoke-EvidenceCommand 'server-render.txt' 'python scripts/verify-render-evidence.py' 'python' @('scripts/verify-render-evidence.py')
Write-Host 'Mo terminal khac, chay npm run start; sau do chay .\scripts\refresh-evidence.ps1 -RuntimeOnly.'
