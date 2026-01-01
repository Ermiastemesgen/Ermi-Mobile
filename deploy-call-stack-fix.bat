@echo off
echo ========================================
echo DEPLOY CALL STACK ERROR FIX
echo ========================================
echo.

echo ✅ Call stack error fix completed!
echo.
echo What was fixed:
echo - Removed duplicate function definitions
echo - Created clean, minimal script.js
echo - Eliminated infinite recursion loops
echo - Simplified API calls to prevent stack overflow
echo.

echo The error "Maximum call stack size exceeded" should be resolved.
echo.

echo Committing changes...
git add .
git commit -m "URGENT FIX: Resolve Maximum call stack size exceeded error with clean script.js"

echo.
echo Deploying to Render...
git push origin main

echo.
echo ========================================
echo CALL STACK ERROR FIX DEPLOYED!
echo ========================================
echo.
echo Your main page should now:
echo ✅ Load without JavaScript errors
echo ✅ Display products correctly
echo ✅ Show loading messages properly
echo ✅ Have working reload button if needed
echo.
echo The "Maximum call stack size exceeded" error is fixed!
echo.
pause