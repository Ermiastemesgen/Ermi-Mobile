@echo off
cls
echo ===================================================
echo   Complete Import to Render
echo ===================================================
echo.
echo This will import:
echo   - 4 Categories
echo   - 9 Products
echo   - Product Images (if any)
echo.
echo From: Localhost Database
echo To:   Render Production
echo.
echo ===================================================
echo.
set /p confirm="Continue with import? (Y/N): "

if /i "%confirm%" NEQ "Y" (
    echo.
    echo Import cancelled.
    pause
    exit
)

echo.
echo Starting complete import...
echo.

node import-all-to-render.js

echo.
echo ===================================================
pause
