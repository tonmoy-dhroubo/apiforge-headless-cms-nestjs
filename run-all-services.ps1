# Start all services using Start-Process with proper output handling
Write-Host "Building project..." -ForegroundColor Yellow
npm run build | Out-Null

Write-Host "Starting all microservices..." -ForegroundColor Green

# Start services using node directly on the compiled files
$gatewayProc = Start-Process node -ArgumentList "dist/apps/gateway/main.js" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2

$authProc = Start-Process node -ArgumentList "dist/apps/auth/main.js" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2

$contentTypeProc = Start-Process node -ArgumentList "dist/apps/content-type/main.js" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2

$contentProc = Start-Process node -ArgumentList "dist/apps/content/main.js" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2

$mediaProc = Start-Process node -ArgumentList "dist/apps/media/main.js" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2

$permissionProc = Start-Process node -ArgumentList "dist/apps/permission/main.js" -PassThru -WindowStyle Hidden

Write-Host "Waiting for services to initialize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "Running API tests..." -ForegroundColor Green
node test-apis.js

Write-Host "`nTest results saved to api-test-results.log" -ForegroundColor Cyan
Write-Host "`nProcess IDs:" -ForegroundColor Yellow
Write-Host "  Gateway: $($gatewayProc.Id)"
Write-Host "  Auth: $($authProc.Id)"
Write-Host "  Content-Type: $($contentTypeProc.Id)"
Write-Host "  Content: $($contentProc.Id)"
Write-Host "  Media: $($mediaProc.Id)"
Write-Host "  Permission: $($permissionProc.Id)"
Write-Host "`nTo stop services, run: Get-Process -Id $($gatewayProc.Id),$($authProc.Id),$($contentTypeProc.Id),$($contentProc.Id),$($mediaProc.Id),$($permissionProc.Id) | Stop-Process" -ForegroundColor Yellow

