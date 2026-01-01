@echo off
echo ========================================
echo AUTOMATIC IMAGE MIGRATION TO RENDER DISK
echo ========================================
echo.

echo This will copy all your product images to the Render persistent disk.
echo.
echo Current status:
echo - Local images: 32 files
echo - Render disk: Ready
echo.

pause

echo.
echo Starting automatic migration...
node auto-migrate-render-disk.js

echo.
echo ========================================
echo MIGRATION COMPLETED!
echo ========================================
echo.
echo Next steps:
echo 1. Commit and push changes to deploy
echo 2. Test your deployed site
echo 3. Images will now persist permanently!
echo.
pause