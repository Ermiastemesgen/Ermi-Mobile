@echo off
cls
echo ========================================
echo   Quick Import to Render
echo ========================================
echo.
echo Found 9 products in localhost database:
echo.
echo   1. Wireless Earbuds - 1800 Birr
echo   2. IPhone Case - 1000 Birr
echo   3. Super Fast Charger - 1400 Birr
echo   4. Mofi Mouse - 1200 Birr
echo   5. Smart Watch - 1500 Birr
echo   6. K9 MICROPHON - 1500 Birr
echo   7. Bluetooth Speaker - 3500 Birr
echo   8. Selfie Stick with Tripod - 900 Birr
echo   9. Wireless Charging Pad - 1200 Birr
echo.
echo ========================================
echo.
set /p confirm="Import these to Render? (Y/N): "

if /i "%confirm%" NEQ "Y" (
    echo.
    echo Import cancelled.
    pause
    exit
)

echo.
echo Starting import...
echo.

node import-localhost-to-render.js

echo.
pause
