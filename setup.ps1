$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$admin = Join-Path $root 'frontend\admin'
$public = Join-Path $root 'frontend\public'

$pythonCandidates = @(
    (Join-Path $env:LOCALAPPDATA 'Programs\Python\Python312\python.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\Python\Python311\python.exe')
)
$python = $pythonCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $python) {
    throw 'No se encontró Python 3.11/3.12. Instálalo con: winget install -e --id Python.Python.3.12'
}
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    throw 'No se encontró npm. Instala Node.js 18 o superior.'
}

$venvPython = Join-Path $backend '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $venvPython)) {
    & $python -m venv (Join-Path $backend '.venv')
}
& $venvPython -m pip install -r (Join-Path $backend 'requirements.txt')

Push-Location $admin
try { npm.cmd ci } finally { Pop-Location }

Push-Location $public
try { npm.cmd ci } finally { Pop-Location }

foreach ($app in @($backend, $admin, $public)) {
    $example = Join-Path $app '.env.example'
    $target = Join-Path $app '.env'
    if ((Test-Path -LiteralPath $example) -and -not (Test-Path -LiteralPath $target)) {
        Copy-Item -LiteralPath $example -Destination $target
    }
}

Write-Host 'CLINIX quedó instalado correctamente.' -ForegroundColor Green
Write-Host 'Ejecuta: .\run-dev.ps1'
