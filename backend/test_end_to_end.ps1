<#
PowerShell end-to-end test for the backend `/predict` flow.

Usage:
  .\test_end_to_end.ps1              # runs health check
  .\test_end_to_end.ps1 -ImagePath ..\test\sample.jpg  # also posts an image

This script:
- loads env vars from the repository `.env` file (one level up from `backend`)
- installs Python requirements
- starts `app.py` in the background
- performs a health check against http://localhost:5000/

Note: Windows may require running PowerShell as Administrator to start background jobs
and to allow script execution (`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`).
#>

param(
  [string]$ImagePath = ""
)

function Load-Dotenv($path) {
  if (-Not (Test-Path $path)) { return }
  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith('#')) { return }
    $parts = $line -split '=', 2
    if ($parts.Length -eq 2) {
      $name = $parts[0].Trim()
      $value = $parts[1].Trim()
      ${env:$name} = $value
    }
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot ".env"
Write-Host "Loading env from: $envFile"
Load-Dotenv $envFile

Set-Location (Join-Path $repoRoot "backend")

Write-Host "Installing Python requirements (this may take a while)..."
python -m pip install -r requirements.txt

Write-Host "Starting backend server (app.py) in background..."
$serverProc = Start-Process -FilePath python -ArgumentList "app.py" -WorkingDirectory (Get-Location) -NoNewWindow -PassThru
Start-Sleep -Seconds 4

try {
  Write-Host "Health check:"
  $health = Invoke-RestMethod -Uri http://localhost:5000/ -Method Get -ErrorAction Stop
  $health | ConvertTo-Json -Depth 4 | Write-Host
} catch {
  Write-Host "Health check failed: $_"
}

if ($ImagePath -ne "") {
  if (-Not (Test-Path $ImagePath)) { Write-Host "Image not found: $ImagePath"; exit 1 }
  Write-Host "Posting image to /predict: $ImagePath"
  # Use curl for multipart upload; modern Windows includes curl. If not available, use Postman.
  $curlCmd = "curl -v -X POST http://localhost:5000/predict -F `"image=@$ImagePath`""
  Write-Host $curlCmd
  Invoke-Expression $curlCmd
}

Write-Host "Backend process id: $($serverProc.Id)"
Write-Host "When finished, stop the server with:`n  Stop-Process -Id $($serverProc.Id)"
