@echo off
setlocal enabledelayedexpansion

echo.
echo  ============================================================
echo   RFP Discovery Platform  -  Windows Launcher
echo  ============================================================
echo.

set "ROOT=%~dp0"

:: ── Check Python ─────────────────────────────────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found.
    echo         Install Python 3.11+ from https://python.org
    echo         Make sure "Add Python to PATH" is ticked during install.
    pause & exit /b 1
)

:: ── Check Node ───────────────────────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found.
    echo         Install Node 18+ from https://nodejs.org
    pause & exit /b 1
)

:: ── Backend setup ────────────────────────────────────────────────────────────
echo [1/4] Setting up backend...
cd /d "%ROOT%backend"

if not exist venv (
    echo       Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo       Installing Python dependencies...
pip install -r requirements.txt -q

if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo       Created backend\.env from .env.example
    )
)

call venv\Scripts\deactivate.bat

:: ── Frontend setup ───────────────────────────────────────────────────────────
echo [2/4] Setting up frontend...
cd /d "%ROOT%frontend"

if not exist node_modules (
    echo       Installing npm packages ^(first run takes ~1 min^)...
    npm install --silent
)

if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo       Created frontend\.env from .env.example
    )
)

:: ── Launch backend ───────────────────────────────────────────────────────────
echo [3/4] Starting backend on http://localhost:5000 ...
start "RFP Backend  :5000" cmd /k "cd /d "%ROOT%backend" && call venv\Scripts\activate.bat && python app.py"

timeout /t 4 /nobreak >nul

:: ── Launch frontend ──────────────────────────────────────────────────────────
echo [4/4] Starting frontend on http://localhost:3000 ...
start "RFP Frontend :3000" cmd /k "cd /d "%ROOT%frontend" && npm start"

echo.
echo  ============================================================
echo   Both servers are starting in separate windows.
echo.
echo     Frontend  ->  http://localhost:3000
echo     Pipeline  ->  http://localhost:3000/pipeline
echo     Backend   ->  http://localhost:5000
echo.
echo   To stop: close the two server windows.
echo  ============================================================
echo.
pause
