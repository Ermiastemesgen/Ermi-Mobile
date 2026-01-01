@echo off
echo ========================================
echo RENDER IMAGE PERSISTENCE - QUICK FIX
echo ========================================
echo.

echo 1. Checking current image storage status...
node fix-render-images-final.js

echo.
echo 2. Running Cloudinary migration...
node migrate-images-to-cloudinary.js

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Go to your deployed Render admin panel
echo 2. Edit products with local images
echo 3. Re-upload images through admin interface
echo 4. Images will now persist permanently
echo.
pause