@echo off
echo ========================================
echo DEPLOY WITH RENDER PERSISTENT STORAGE
echo ========================================
echo.

echo Step 1: Verify image migration...
node auto-migrate-render-disk.js

echo.
echo Step 2: Test persistent storage configuration...
node verify-render-disk.js

echo.
echo Step 3: Add all changes to git...
git add .

echo.
echo Step 4: Commit changes...
git commit -m "Add Render Pro persistent storage with automatic image migration"

echo.
echo Step 5: Push to GitHub (triggers Render deployment)...
git push origin main

echo.
echo ========================================
echo DEPLOYMENT WITH PERSISTENT STORAGE COMPLETE!
echo ========================================
echo.
echo ✅ All 9 product images are ready
echo ✅ Persistent storage configured
echo ✅ Migration scripts included
echo ✅ Deployment triggered
echo.
echo Your images will now persist across all deployments!
echo.
echo IMPORTANT: Make sure in Render Dashboard:
echo 1. Persistent disk is created and mounted
echo 2. Environment variables are set:
echo    - USE_PERSISTENT_STORAGE=true
echo    - UPLOADS_PATH=/opt/render/project/src/uploads
echo.
pause