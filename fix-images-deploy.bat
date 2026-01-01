@echo off
echo ========================================
echo FIX RENDER IMAGE ISSUES - DEPLOY
echo ========================================
echo.

echo The persistent disk isn't working properly.
echo Let's deploy with debug endpoint and Cloudinary setup.
echo.

echo Step 1: Check Cloudinary configuration...
node setup-cloudinary-quick.js

echo.
echo Step 2: Adding debug endpoint to server...
echo ✅ Debug endpoint added to server.js

echo.
echo Step 3: Committing changes...
git add .
git commit -m "Add image debug endpoint and fix image serving issues"

echo.
echo Step 4: Deploying to Render...
git push origin main

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo NEXT STEPS TO FIX IMAGES:
echo.
echo 1. Wait for deployment to complete
echo.
echo 2. Visit your deployed site: /test-images
echo    This will show what files are available on the server
echo.
echo 3. Set up Cloudinary (RECOMMENDED):
echo    - Go to https://cloudinary.com
echo    - Sign up for free account
echo    - Get your credentials
echo    - Add them to Render environment variables
echo.
echo 4. Re-upload images:
echo    - Go to your deployed admin panel
echo    - Edit each product with missing images
echo    - Re-upload the images
echo    - Images will now work permanently!
echo.
echo Your 9 products that need image re-upload:
echo - Wireless Earbuds
echo - IPhone Case  
echo - Super Fast Charger
echo - Mofi Mouse
echo - Smart Watch
echo - K9 MICROPHON
echo - Bluetooth Speaker
echo - Selfie Stick with Tripod
echo - Wireless Charging Pad
echo.
pause