# SkillWise API Test Script
# Run this to test the authentication endpoints

Write-Host "🧪 Testing SkillWise API..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/healthz" -Method GET
    Write-Host "✅ Health Check: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API Documentation
Write-Host "`n2. Testing API Documentation..." -ForegroundColor Yellow
try {
    $api = Invoke-RestMethod -Uri "http://localhost:3001/api" -Method GET
    Write-Host "✅ API: $($api.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Register New User
Write-Host "`n3. Testing User Registration..." -ForegroundColor Yellow
$testEmail = "testuser$(Get-Random)@example.com"
$registerBody = @{
    email = $testEmail
    password = "testpassword123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Registration successful for: $testEmail" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.data.user.id)" -ForegroundColor Cyan
    
    # Test 4: Login with New User
    Write-Host "`n4. Testing User Login..." -ForegroundColor Yellow
    $loginBody = @{
        email = $testEmail
        password = "testpassword123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   Access Token: $($loginResponse.data.accessToken.Substring(0,20))..." -ForegroundColor Cyan
    
    # Test 5: Access Protected Route
    Write-Host "`n5. Testing Protected Route (User Profile)..." -ForegroundColor Yellow
    $headers = @{
        'Authorization' = "Bearer $($loginResponse.data.accessToken)"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/users/profile" -Method GET -Headers $headers
    Write-Host "✅ Protected route access successful!" -ForegroundColor Green
    Write-Host "   Profile: $($profileResponse.data.firstName) $($profileResponse.data.lastName)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Registration/Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error Details: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Test Complete! Check the results above." -ForegroundColor Green
Write-Host "📱 Now try the web interface at: http://localhost:3000" -ForegroundColor Cyan