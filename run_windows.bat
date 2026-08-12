@echo off
setlocal
cd /d "%~dp0"
echo Starting Neon City V10.1 local server...
echo.
where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8000"
  py -m http.server 8000
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8000"
  python -m http.server 8000
  goto :end
)
echo Python was not found.
echo Install Python from https://www.python.org/downloads/ OR open this folder in VS Code and use Live Server.
pause
:end
