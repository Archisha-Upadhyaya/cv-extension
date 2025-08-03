@echo off
REM 🚀 Quick Deploy Script for Cover Letter Extension API (Windows)

echo 🚀 Setting up your Cover Letter API for global deployment...
echo.

REM Check if we're in the right directory
if not exist "vercel.json" (
    echo ❌ Error: Please run this script from the root directory of your project
    echo    ^(The directory that contains vercel.json^)
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo 🔑 Make sure you have your Gemini API key ready!
echo    Get it from: https://aistudio.google.com/app/apikey
echo.

echo 🌐 Deploying to Vercel...
echo    This will make your API available worldwide!
echo.

REM Deploy to Vercel
vercel

echo.
echo ✅ Deployment started!
echo.
echo 📋 Next steps:
echo 1. Add your GEMINI_API_KEY in the Vercel dashboard
echo 2. Copy your deployment URL
echo 3. Update the extension to use your URL
echo 4. Rebuild the extension: pnpm run build
echo.
echo 🔗 Vercel Dashboard: https://vercel.com/dashboard
echo.
echo 🎉 Your users will now be able to use the extension without localhost!
pause
