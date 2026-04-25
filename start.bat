@echo off
setlocal enabledelayedexpansion

echo =========================================
echo  RFP Discovery Platform - Windows Start
echo =========================================
echo.

:: ── Resolve the directory this script lives in ───────────────────────────────
set "ROOT=%~dp0"

:: ── Check Python ──────────────────────────────────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.11+ from https://python.org
    echo         Make sure "Add Python to PATH" is checked during install.
    pause
    exit /b 1
)

:: ── Check Node ────────────────────────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install Node 18+ from https://nodejs.org
    pause
    exit /b 1
)

:: ── Backend: create venv + install deps in this window first, then launch ─────
echo [1/4] Setting up Python virtual environment...
cd /d "%ROOT%backend"
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
echo [2/4] Installing backend dependencies...
pip install -r requirements.txt -q
call venv\Scripts\deactivate.bat

:: ── Frontend: install npm packages ───────────────────────────────────────────
echo [3/4] Installing frontend dependencies...
cd /d "%ROOT%frontend"
if not exist node_modules (
    npm install --silent
)
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo       Created frontend\.env from .env.example
    )
)

:: ── Launch both services in new windows ──────────────────────────────────────
echo [4/4] Launching services...
echo.

start "RFP Backend  :5000" cmd /k "cd /d "%ROOT%backend" && call venv\Scripts\activate.bat && python app.py"

:: Give Flask a moment to start before the browser opens
timeout /t 4 /noisy >nul

start "RFP Frontend :3000" cmd /k "cd /d "%ROOT%frontend" && npm start"

echo =========================================
echo  Services starting in separate windows:
echo    Backend  ->  http://localhost:5000
echo    Frontend ->  http://localhost:3000
echo.
echo  Close this window or the service windows
echo  to stop individual services.
echo =========================================
echo.
pause
