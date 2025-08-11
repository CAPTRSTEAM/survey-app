@echo off
echo ========================================
echo   Survey Taker Deployment Script
echo ========================================
echo.

REM Check if dist folder exists
if not exist "dist" (
    echo ERROR: dist folder not found!
    echo Please run 'npm run build' first.
    echo.
    pause
    exit /b 1
)

echo Current build files found:
dir dist\assets\*.js /b
echo.

REM Prompt for server path
set /p SERVER_PATH="Enter server path (e.g., C:\path\to\server\survey-taker): "

if "%SERVER_PATH%"=="" (
    echo ERROR: Server path is required!
    pause
    exit /b 1
)

echo.
echo Starting deployment to: %SERVER_PATH%
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "DEPLOYMENT_SCRIPT.ps1" -ServerPath "%SERVER_PATH%"

echo.
echo Deployment completed! Press any key to exit.
pause >nul
