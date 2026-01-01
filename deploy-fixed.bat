@echo off
echo ========================================
echo DEPLOYING FIXED VERSION TO RENDER
echo ========================================
echo.

echo 1. Checking dependencies...
node fix-deployment-error.js

echo.
echo 2. Adding all changes to git...
git add .

echo.
echo 3. Committing changes...
git commit -m "Fix deployment: Add missing security dependencies and image storage"

echo.
echo 4. Pushing to GitHub (triggers Render deployment)...
git push origin main

echo.
echo ========================================
echo DEPLOYMENT INITIATED!
echo ========================================
echo.
echo Next steps:
echo 1. Check Render dashboard for deployment status
echo 2. Once deployed, set up Cloudinary environment variables
echo 3. Re-upload product images through admin panel
echo.
pause