# Survey Taker Deployment Script
# This script ensures clean deployment by removing old files and uploading only new ones

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerPath,
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = ".\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

Write-Host "🚀 Starting Survey Taker Deployment..." -ForegroundColor Green
Write-Host "Server Path: $ServerPath" -ForegroundColor Cyan
Write-Host "Backup Path: $BackupPath" -ForegroundColor Cyan

# Step 1: Create backup of current server files
Write-Host "`n📦 Creating backup of current server files..." -ForegroundColor Yellow
if (Test-Path $ServerPath) {
    if (!(Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    }
    Copy-Item -Path "$ServerPath\*" -Destination $BackupPath -Recurse -Force
    Write-Host "✅ Backup created at: $BackupPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  Server path does not exist, skipping backup" -ForegroundColor Yellow
}

# Step 2: Clean server directory (remove all old files)
Write-Host "`n🧹 Cleaning server directory..." -ForegroundColor Yellow
if (Test-Path $ServerPath) {
    # Remove all files and directories
    Get-ChildItem -Path $ServerPath -Recurse | Remove-Item -Recurse -Force
    Write-Host "✅ Server directory cleaned" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Server path does not exist, will create it" -ForegroundColor Blue
}

# Step 3: Create server directory if it doesn't exist
if (!(Test-Path $ServerPath)) {
    New-Item -ItemType Directory -Path $ServerPath -Force | Out-Null
    Write-Host "✅ Server directory created" -ForegroundColor Green
}

# Step 4: Copy new dist files to server
Write-Host "`n📤 Copying new dist files to server..." -ForegroundColor Yellow
if (Test-Path ".\dist") {
    Copy-Item -Path ".\dist\*" -Destination $ServerPath -Recurse -Force
    Write-Host "✅ New files copied to server" -ForegroundColor Green
} else {
    Write-Host "❌ Error: dist directory not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# Step 5: Verify deployment
Write-Host "`n🔍 Verifying deployment..." -ForegroundColor Yellow
$deployedFiles = Get-ChildItem -Path $ServerPath -Recurse -File | Select-Object Name, FullName
Write-Host "Files deployed:" -ForegroundColor Cyan
$deployedFiles | ForEach-Object { Write-Host "  📄 $($_.Name)" -ForegroundColor White }

# Step 6: Check for old file hashes
Write-Host "`n🔍 Checking for old file hashes..." -ForegroundColor Yellow
$oldHashes = @("DybwZhtg", "DPzfUFWB", "Da1Y_2Od", "C91VHdnL")
$foundOldFiles = @()

foreach ($hash in $oldHashes) {
    $oldFiles = $deployedFiles | Where-Object { $_.Name -like "*$hash*" }
    if ($oldFiles) {
        $foundOldFiles += $oldFiles
        Write-Host "❌ Found old file with hash $hash" -ForegroundColor Red
    }
}

if ($foundOldFiles.Count -eq 0) {
    Write-Host "✅ No old file hashes found - deployment is clean!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Old files found. Manual cleanup may be needed." -ForegroundColor Yellow
}

# Step 7: Display new file hashes
Write-Host "`n🔍 New file hashes deployed:" -ForegroundColor Yellow
$newFiles = $deployedFiles | Where-Object { $_.Name -like "*.js" -or $_.Name -like "*.css" }
foreach ($file in $newFiles) {
    $hash = if ($file.Name -match '\.([A-Za-z0-9]{8})\.') { $matches[1] } else { "N/A" }
    Write-Host "  📄 $($file.Name) (Hash: $hash)" -ForegroundColor White
}

Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "📁 Backup location: $BackupPath" -ForegroundColor Cyan
Write-Host "🌐 Server location: $ServerPath" -ForegroundColor Cyan
Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the application in your browser" -ForegroundColor White
Write-Host "  2. Clear browser cache if needed (Ctrl+F5)" -ForegroundColor White
Write-Host "  3. Verify new file hashes are loading in Network tab" -ForegroundColor White
