<#
Usage examples:

powershell -ExecutionPolicy Bypass -File .\scripts\start-local-web.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\start-local-web.ps1 -SkipInstall
powershell -ExecutionPolicy Bypass -File .\scripts\start-local-web.ps1 -SkipInstall -SkipPrismaGenerate
powershell -ExecutionPolicy Bypass -File .\scripts\start-local-web.ps1 -NoBuild
powershell -ExecutionPolicy Bypass -File .\scripts\start-local-web.ps1 -Detach
#>

param(
    [switch]$SkipInstall,
    [switch]$SkipPrismaGenerate,
    [switch]$NoBuild,
    [switch]$Detach
)

$ErrorActionPreference = 'Stop'

function Assert-CommandExists {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found in PATH."
    }
}

function Set-DefaultEnv {
    param(
        [string]$Name,
        [string]$Value
    )

    $currentValue = [Environment]::GetEnvironmentVariable($Name)
    if (-not [string]::IsNullOrWhiteSpace($currentValue)) {
        return
    }

    Set-Item -Path "Env:$Name" -Value $Value
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir

Push-Location $repoRoot
try {
    Assert-CommandExists -Name 'docker'
    Assert-CommandExists -Name 'npm'

    Write-Host 'Starting Docker services (Postgres, Redis, Jaeger, Flyway)...' -ForegroundColor Cyan
    docker compose up -d app-db telemetry-db redis jaeger flyway
    if ($LASTEXITCODE -ne 0) {
        throw 'docker compose failed.'
    }

    Set-DefaultEnv -Name 'DATABASE_URL' -Value 'postgresql://postgres:postgres@localhost:5433/sirtaskalot'
    Set-DefaultEnv -Name 'TELEMETRY_DATABASE_URL' -Value 'postgresql://postgres:postgres@localhost:5434/telemetry'
    Set-DefaultEnv -Name 'REDIS_URL' -Value 'redis://localhost:6379'
    Set-DefaultEnv -Name 'OTEL_EXPORTER_OTLP_ENDPOINT' -Value 'http://localhost:4318/v1/traces'
    Set-DefaultEnv -Name 'NEXTAUTH_URL' -Value 'http://localhost:3000'
    Set-DefaultEnv -Name 'NEXTAUTH_SECRET' -Value 'development-secret'
    Set-DefaultEnv -Name 'GITHUB_CLIENT_ID' -Value 'demo'
    Set-DefaultEnv -Name 'GITHUB_CLIENT_SECRET' -Value 'demo'
    Set-DefaultEnv -Name 'GOOGLE_CLIENT_ID' -Value 'demo'
    Set-DefaultEnv -Name 'GOOGLE_CLIENT_SECRET' -Value 'demo'

    if (-not $SkipInstall) {
        Write-Host 'Installing dependencies...' -ForegroundColor Cyan
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw 'npm install failed.'
        }
    }

    if (-not $SkipPrismaGenerate) {
        Write-Host 'Generating Prisma client...' -ForegroundColor Cyan
        npm run prisma:generate
        if ($LASTEXITCODE -ne 0) {
            throw 'Prisma generation failed.'
        }
    }

    if (-not $NoBuild) {
        Write-Host 'Running web typecheck...' -ForegroundColor Cyan
        npm run typecheck --workspace=@sirtaskalot/web
        if ($LASTEXITCODE -ne 0) {
            throw 'Web typecheck failed.'
        }
    }

    Write-Host ''
    Write-Host 'Local environment is ready.' -ForegroundColor Green
    Write-Host 'Web app:    http://localhost:3000'
    Write-Host 'Jaeger UI:  http://localhost:16686'
    Write-Host 'App DB:     localhost:5433'
    Write-Host 'Telemetry:  localhost:5434'
    Write-Host 'Redis:      localhost:6379'
    Write-Host ''

    if ($Detach) {
        Write-Host 'Starting web app in a separate PowerShell process...' -ForegroundColor Cyan
        $command = "Set-Location '$repoRoot'; npm run dev --workspace=@sirtaskalot/web"
        Start-Process powershell -ArgumentList '-NoExit', '-Command', $command | Out-Null
    }
    else {
        Write-Host 'Starting web app in this shell...' -ForegroundColor Cyan
        npm run dev --workspace=@sirtaskalot/web
    }
}
finally {
    Pop-Location
}
