@echo off
cls
echo ========================================
echo   Render Auto-Deploy Diagnostic
echo ========================================
echo.

echo Checking Git setup...
echo.
git remote -v
echo.

echo Current branch:
git branch --show-current
echo.

echo Recent commits:
git log --oneline -3
echo.

echo Files ready to deploy:
git status --short
echo.

echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Go to https://dashboard.render.com
echo 2. Click on your service
echo 3. Go to Settings tab
echo 4. Check "Auto-Deploy" is enabled
echo 5. Check "Branch" is set to "main"
echo.
echo To deploy now, run:
echo   deploy-to-render.bat
echo.
echo ========================================
pause
