@echo off
echo ====================================================
echo Starting AutoVanguard - Car Dealership Inventory System
echo ====================================================

echo [1/2] Launching Backend Server (Port 5000)...
start "AutoVanguard Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Frontend App (Port 5173)...
start "AutoVanguard Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both services are starting in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000
echo.
