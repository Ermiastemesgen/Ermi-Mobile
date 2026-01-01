@echo off
echo ========================================
echo   Import Products to Render
echo ========================================
echo.
echo This will copy all products from your
echo localhost admin to Render admin.
echo.
echo Make sure:
echo   1. Your localhost server has products
echo   2. You know your Render URL
echo   3. You know your Render admin login
echo.
pause
echo.

node import-localhost-to-render.js

echo.
echo ========================================
echo Press any key to exit...
pause >nul
