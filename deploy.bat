@echo off
REM Quick Deploy Script for Railway (Windows)
REM Usage: deploy.bat "Your commit message"

if "%~1"=="" (
    echo ❌ Error: Please provide a commit message
    echo Usage: deploy.bat "Your commit message"
    exit /b 1
)

echo 🚀 Starting deployment process...
echo.

REM Stage all changes
echo 📦 Staging changes...
git add -A

REM Commit changes
echo 💾 Committing changes...
git commit -m "%~1"

REM Push to GitHub (triggers Railway deploy)
echo 🌐 Pushing to GitHub...
git push origin main

echo.
echo ✅ Changes pushed to GitHub!
echo 🚂 Railway will automatically deploy in 1-2 minutes
echo 📊 Check status: https://railway.app/dashboard
echo 🌍 Your site: https://ermimobile.up.railway.app
