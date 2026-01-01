@echo off
cls
echo ========================================
echo   Opening Uploads Folder
echo ========================================
echo.
echo This folder contains all your product images.
echo.
echo You'll need these files to upload to Render admin.
echo.
pause
echo.
echo Opening folder...

start "" "%CD%\uploads"

echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Keep this folder open
echo 2. Go to: https://your-app.onrender.com/admin.html
echo 3. Login with admin credentials
echo 4. Edit each product
echo 5. Upload the image from this folder
echo 6. Save
echo.
echo See UPLOAD_IMAGES_TO_RENDER.md for details!
echo.
pause
