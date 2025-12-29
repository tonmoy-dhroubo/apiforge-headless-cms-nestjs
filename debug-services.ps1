# Debug script to capture service output and test endpoints
Write-Host "Stopping any running services..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Building project..." -ForegroundColor Yellow
npm run build | Out-Null

Write-Host "Starting services with output capture..." -ForegroundColor Green

# Start services and capture output to files
$gatewayProc = Start-Process node -ArgumentList "dist/apps/gateway/main.js" -PassThru -RedirectStandardOutput "gateway.log" -RedirectStandardError "gateway-error.log" -NoNewWindow
Start-Sleep -Seconds 2

$authProc = Start-Process node -ArgumentList "dist/apps/auth/main.js" -PassThru -RedirectStandardOutput "auth.log" -RedirectStandardError "auth-error.log" -NoNewWindow
Start-Sleep -Seconds 2

$contentTypeProc = Start-Process node -ArgumentList "dist/apps/content-type/main.js" -PassThru -RedirectStandardOutput "content-type.log" -RedirectStandardError "content-type-error.log" -NoNewWindow
Start-Sleep -Seconds 2

$contentProc = Start-Process node -ArgumentList "dist/apps/content/main.js" -PassThru -RedirectStandardOutput "content.log" -RedirectStandardError "content-error.log" -NoNewWindow
Start-Sleep -Seconds 2

$mediaProc = Start-Process node -ArgumentList "dist/apps/media/main.js" -PassThru -RedirectStandardOutput "media.log" -RedirectStandardError "media-error.log" -NoNewWindow
Start-Sleep -Seconds 2

$permissionProc = Start-Process node -ArgumentList "dist/apps/permission/main.js" -PassThru -RedirectStandardOutput "permission.log" -RedirectStandardError "permission-error.log" -NoNewWindow

Write-Host "Waiting for services to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n=== Service Status ===" -ForegroundColor Cyan
Write-Host "Gateway PID: $($gatewayProc.Id)"
Write-Host "Auth PID: $($authProc.Id)"
Write-Host "Content-Type PID: $($contentTypeProc.Id)"
Write-Host "Content PID: $($contentProc.Id)"
Write-Host "Media PID: $($mediaProc.Id)"
Write-Host "Permission PID: $($permissionProc.Id)"

Write-Host "`n=== Checking for Errors ===" -ForegroundColor Cyan
$errorFiles = @("gateway-error.log", "auth-error.log", "content-type-error.log", "content-error.log", "media-error.log", "permission-error.log")
foreach ($file in $errorFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        if ($content) {
            Write-Host "`n${file}:" -ForegroundColor Red
            $content | Select-Object -Last 20
        }
    }
}

Write-Host "`n=== Testing Auth Register ===" -ForegroundColor Cyan
$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Error Response: $responseBody" -ForegroundColor Red
}

Write-Host "`n=== Recent Service Logs ===" -ForegroundColor Cyan
$logFiles = @("gateway.log", "auth.log", "content-type.log", "content.log", "media.log", "permission.log")
foreach ($file in $logFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        if ($content) {
            Write-Host "`n${file} (last 10 lines):" -ForegroundColor Yellow
            $content | Select-Object -Last 10
        }
    }
}

Write-Host "`n=== Process IDs ===" -ForegroundColor Cyan
Write-Host "To stop services: Get-Process -Id $($gatewayProc.Id),$($authProc.Id),$($contentTypeProc.Id),$($contentProc.Id),$($mediaProc.Id),$($permissionProc.Id) | Stop-Process"
Write-Host "`nLog files created in current directory. Check error logs for details." -ForegroundColor Yellow

