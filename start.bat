@echo off
TITLE SPRASH e-Library Server
echo ===================================================
echo Welcome to SPRASH e-Library!
echo ===================================================
echo.

:: Navigate to the server directory
cd /d "%~dp0server"

:: Check if node_modules exists, if not, install dependencies
if not exist "node_modules\" (
    echo [INFO] First time setup: Installing server dependencies...
    call npm install
    
    echo [INFO] Seeding the database with placeholder books...
    call npm run seed
)

:: Wait a moment to ensure everything is ready
timeout /t 2 /nobreak > NUL

:: Open the browser automatically
echo [INFO] Opening the application in your default web browser...
start http://localhost:5000

:: Start the server
echo [INFO] Starting the Node.js server...
echo.
npm start

pause
