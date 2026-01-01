@echo off
echo ========================================
echo EMERGENCY DEPLOYMENT FIX
echo ========================================
echo.

echo Current git status:
git status

echo.
echo Adding all changes...
git add .

echo.
echo Committing with fixed dependencies...
git commit -m "DEPLOYMENT FIX: Add missing security dependencies (express-rate-limit, helmet, validator)"

echo.
echo Pushing to trigger new deployment...
git push origin main

echo.
echo ========================================
echo NEW DEPLOYMENT TRIGGERED!
echo ========================================
echo.
echo The old commit 770edbb was failing.
echo This creates a NEW commit with fixed dependencies.
echo Check Render dashboard for the new deployment status.
echo.
pause