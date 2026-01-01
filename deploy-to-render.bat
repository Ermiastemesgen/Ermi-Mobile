@echo off
echo ========================================
echo   Deploying to Render.com
echo ========================================
echo.

echo Step 1: Adding all changes to git...
git add .
echo.

echo Step 2: Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=Update deployment

git commit -m "%commit_message%"
echo.

echo Step 3: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   Deployment Triggered!
echo ========================================
echo.
echo Render will automatically deploy in 1-2 minutes.
echo.
echo Check deployment status:
echo   https://dashboard.render.com
echo.
echo Your site will be live at:
echo   https://your-app.onrender.com
echo.
echo Press any key to exit...
pause >nul
