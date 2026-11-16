@echo off
title AI Smart Traffic Management System Launcher
echo ======================================================================
echo    TRAFFIC.AI - Smart Traffic Management System (CSE Major Project)
echo ======================================================================
echo.
echo Current Directory: %~dp0
echo.
echo [1/3] Starting Backend API Server (Node.js + Socket.IO on port 5000)...
start "Traffic Backend" cmd /k "cd /d "%~dp0backend" && npm start"

echo.
echo [2/3] Starting Frontend Web Dashboard (React + Vite on port 3000)...
start "Traffic Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo [3/3] Launching Web Dashboard in your browser...
timeout /t 3 /nobreak > nul
start http://localhost:3000

echo.
echo ======================================================================
echo System successfully started!
echo - Web Dashboard: http://localhost:3000
echo - Backend API:   http://localhost:5000/api/health
echo - AI Service:    Run 'cd ai-engine && python main.py' for Python YOLO
echo ======================================================================
pause
