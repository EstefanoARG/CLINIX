$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$admin = Join-Path $root 'frontend\admin'
$public = Join-Path $root 'frontend\public'
$python = Join-Path $backend '.venv\Scripts\python.exe'
$node = (Get-Command node.exe -ErrorAction Stop).Source
$adminVite = Join-Path $admin 'node_modules\vite\bin\vite.js'
$publicVite = Join-Path $public 'node_modules\vite\bin\vite.js'

if (-not (Test-Path -LiteralPath $python)) {
    throw 'Falta backend\.venv. Ejecuta primero .\setup.ps1'
}
if (-not (Test-Path -LiteralPath $adminVite) -or -not (Test-Path -LiteralPath $publicVite)) {
    throw 'Faltan dependencias de frontend. Ejecuta primero .\setup.ps1'
}

$processes = @()
try {
    $processes += Start-Process -FilePath $python -ArgumentList '-m','uvicorn','app.main:app','--reload','--port','8000' -WorkingDirectory $backend -WindowStyle Hidden -PassThru
    $processes += Start-Process -FilePath $node -ArgumentList $adminVite,'--host','127.0.0.1','--port','5175' -WorkingDirectory $admin -WindowStyle Hidden -PassThru
    $processes += Start-Process -FilePath $node -ArgumentList $publicVite,'--host','127.0.0.1','--port','5174' -WorkingDirectory $public -WindowStyle Hidden -PassThru

    Start-Sleep -Seconds 5
    Write-Host 'CLINIX está ejecutándose:' -ForegroundColor Green
    Write-Host '  Portal público:        http://localhost:5174'
    Write-Host '  Portal administrativo: http://localhost:5175'
    Write-Host '  API / Swagger:         http://localhost:8000/docs'
    Write-Host ''
    Write-Host 'Presiona Ctrl+C para detener todos los servicios.'

    while ($true) {
        Start-Sleep -Seconds 2
    }
}
finally {
    foreach ($process in $processes) {
        $null = & taskkill.exe /PID $process.Id /T /F 2>$null
    }
}
