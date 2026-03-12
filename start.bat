@echo off
title Mr Amer Platform
color 0A

echo.
echo  =============================================
echo   Mr Amer Platform - Starting...
echo  =============================================
echo.

echo  [1/2] Starting Backend (port 5001)...
start "Backend - Mr Amer" cmd /k "cd /d "F:\Amer\Mr Amer Platform\Backend\EduPlatform.API" && dotnet run --no-restore"

timeout /t 3 /nobreak >nul

echo  [2/2] Starting Frontend (port 5173)...
start "Frontend - Mr Amer" cmd /k "cd /d "F:\Amer\Mr Amer Platform\Frontend" && npm run dev"

echo.
echo  =============================================
echo   Both servers are starting...
echo   Backend  : http://localhost:5001
echo   Frontend : http://localhost:5173
echo  =============================================
echo.
echo  Press any key to open the app in browser...
pause >nul

start http://localhost:5173
