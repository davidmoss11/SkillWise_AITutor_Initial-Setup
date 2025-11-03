# Simple SkillWise API Test
Write-Host "Testing SkillWise API..." -ForegroundColor Green

# Health Check
$health = Invoke-RestMethod -Uri "http://localhost:3001/healthz" -Method GET
Write-Host "Health: $($health.status)" -ForegroundColor Green

# Register a test user
$email = "testuser$(Get-Random)@example.com"
$body = @{
    email = $email
    password = "testpass123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Registration successful for: $email" -ForegroundColor Green
    
    # Login
    $loginBody = @{
        email = $email
        password = "testpass123"
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful! Token received." -ForegroundColor Green
    
    Write-Host "All tests passed! You can now use the web interface." -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}