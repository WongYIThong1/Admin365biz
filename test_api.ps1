# Admin API Test Utility
# This script demonstrates the two-step login flow (Password -> MFA)

$baseUrl = "http://api.my365biz.com"

function Test-AdminLogin {
    param (
        [string]$email = "admin@example.com",
        [string]$password = "password123"
    )

    Write-Host "`n--- Step 1: Attempting Login ---" -ForegroundColor Cyan
    $body = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Method Post -Uri "$baseUrl/auth/admin/login" -ContentType "application/json" -Body $body -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        Write-Host "Success: Logged in directly!" -ForegroundColor Green
        return $data
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorBody)
        $errorText = $reader.ReadToEnd()
        $errorData = $errorText | ConvertFrom-Json

        if ($statusCode -eq 401 -and $errorData.error -eq "mfa_required") {
            Write-Host "MFA Required! Received mfaToken." -ForegroundColor Yellow
            $mfaToken = $errorData.mfaToken
            
            $code = Read-Host "Please enter your 6-digit MFA code (TOTP)"
            
            Write-Host "`n--- Step 2: Verifying MFA ---" -ForegroundColor Cyan
            $mfaBody = @{
                mfaToken = $mfaToken
                totpCode = $code
            } | ConvertTo-Json

            try {
                $finalResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/admin/mfa" -ContentType "application/json" -Body $mfaBody
                Write-Host "Success: MFA Verified! AccessToken obtained.`n" -ForegroundColor Green
                return $finalResponse
            }
            catch {
                Write-Host "Error: MFA Verification failed." -ForegroundColor Red
                $_.Exception.Message
                return $null
            }
        }
        else {
            Write-Host "Error: Login failed with code $statusCode" -ForegroundColor Red
            Write-Host $errorText
            return $null
        }
    }
}

# Example Usage:
# $result = Test-AdminLogin
# if ($result) { $result.accessToken }

Write-Host "API Test Script Loaded." -ForegroundColor Gray
Write-Host "Usage: `$result = Test-AdminLogin -email 'your@email.com' -password 'yourpass'`" -ForegroundColor Gray
