# Survey Taker Deployment Verification Script
# Use this to verify that deployment was successful and no old files remain

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerPath
)

Write-Host "🔍 Verifying Survey Taker Deployment..." -ForegroundColor Green
Write-Host "Server Path: $ServerPath" -ForegroundColor Cyan

if (!(Test-Path $ServerPath)) {
    Write-Host "❌ Error: Server path does not exist!" -ForegroundColor Red
    exit 1
}

# Check for expected new files
Write-Host "`n📋 Checking for expected new files..." -ForegroundColor Yellow
$expectedFiles = @(
    "index.html",
    "assets\survey-app.CO4mGQmK.js",
    "assets\index.Cd9odeHc.js", 
    "assets\error-boundary.GxYbDaxA.js",
    "assets\api-provider.TDD0SKB3.js",
    "assets\index.dIB3e0Im.css"
)

$missingFiles = @()
foreach ($file in $expectedFiles) {
    $fullPath = Join-Path $ServerPath $file
    if (Test-Path $fullPath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

# Check for old file hashes (these should NOT exist)
Write-Host "`n🚫 Checking for old file hashes (should NOT exist)..." -ForegroundColor Yellow
$oldHashes = @("DybwZhtg", "DPzfUFWB", "Da1Y_2Od", "C91VHdnL")
$foundOldFiles = @()

$allFiles = Get-ChildItem -Path $ServerPath -Recurse -File
foreach ($hash in $oldHashes) {
    $oldFiles = $allFiles | Where-Object { $_.Name -like "*$hash*" }
    if ($oldFiles) {
        foreach ($file in $oldFiles) {
            Write-Host "  ❌ Found old file: $($file.Name)" -ForegroundColor Red
            $foundOldFiles += $file
        }
    } else {
        Write-Host "  ✅ No files with hash: $hash" -ForegroundColor Green
    }
}

# Display all deployed files
Write-Host "`n📁 All deployed files:" -ForegroundColor Yellow
$deployedFiles = Get-ChildItem -Path $ServerPath -Recurse -File | Select-Object Name, FullName
$deployedFiles | ForEach-Object { 
    $hash = if ($_.Name -match '\.([A-Za-z0-9]{8})\.') { $matches[1] } else { "N/A" }
    Write-Host "  📄 $($_.Name) (Hash: $hash)" -ForegroundColor White 
}

# Summary
Write-Host "`n📊 Deployment Verification Summary:" -ForegroundColor Cyan
Write-Host "  Expected files: $($expectedFiles.Count)" -ForegroundColor White
Write-Host "  Missing files: $($missingFiles.Count)" -ForegroundColor White
Write-Host "  Old files found: $($foundOldFiles.Count)" -ForegroundColor White

if ($missingFiles.Count -eq 0 -and $foundOldFiles.Count -eq 0) {
    Write-Host "`n🎉 SUCCESS: Deployment verification passed!" -ForegroundColor Green
    Write-Host "✅ All expected files are present" -ForegroundColor Green
    Write-Host "✅ No old files remain" -ForegroundColor Green
    Write-Host "✅ React errors should be resolved" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  WARNING: Deployment verification failed!" -ForegroundColor Yellow
    if ($missingFiles.Count -gt 0) {
        Write-Host "❌ Missing files:" -ForegroundColor Red
        $missingFiles | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    }
    if ($foundOldFiles.Count -gt 0) {
        Write-Host "❌ Old files found:" -ForegroundColor Red
        $foundOldFiles | ForEach-Object { Write-Host "    $($_.Name)" -ForegroundColor Red }
    }
    Write-Host "`n💡 Recommendation: Re-run deployment script" -ForegroundColor Yellow
}

Write-Host "`n🔍 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the application in your browser" -ForegroundColor White
Write-Host "  2. Clear browser cache (Ctrl+F5)" -ForegroundColor White
Write-Host "  3. Check Network tab for new file hashes" -ForegroundColor White
Write-Host "  4. Verify no more React errors" -ForegroundColor White
