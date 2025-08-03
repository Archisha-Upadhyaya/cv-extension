@echo off
echo 🚀 Starting Cover Letter Generator API Server...
echo.
echo 📍 Server will run on: http://localhost:3001
echo 📍 Health check: http://localhost:3001/api/health
echo.
echo 🔄 Starting in development mode with auto-reload...
echo.

cd /d "%~dp0api"
pnpm run dev
