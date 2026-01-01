@echo off
echo ========================================
echo DEPLOYING WITH RENDER PRO STORAGE
echo ========================================
echo.

echo 1. Checking Render Pro configuration...
node configure-render-pro.js

echo.
echo 2. Testing storage setup...
node setup-render-pro-storage.js

echo.
echo 3. Adding changes to git...
git add .

echo.
echo 4. Committing Render Pro configuration...
git commit -m "Add Render Pro persistent storage configuration"

echo.
echo 5. Pushing to GitHub (triggers deployment)...
git push origin main

echo.
echo ========================================
echo RENDER PRO DEPLOYMENT INITIATED!
echo ========================================
echo.
echo IMPORTANT: Complete these steps in Render Dashboard:
echo.
echo 1. Go to your service Settings
echo 2. Add Persistent Disk:
echo    - Name: uploads-storage
echo    - Mount Path: /opt/render/project/src/uploads
echo    - Size: 1GB or more
echo 3. Set Environment Variables:
echo    - USE_PERSISTENT_STORAGE=true
echo    - UPLOADS_PATH=/opt/render/project/src/uploads
echo.
echo After setup, your images will persist permanently!
echo.
pause