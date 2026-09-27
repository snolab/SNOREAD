@echo off
cd /d "%~dp0"
call npm run build
exit /b %errorlevel%
