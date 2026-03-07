@echo off
REM 🔧 FoodHub Production Deployment Test Script
REM This script verifies that restaurants are loading correctly in production

echo ===========================================
echo FoodHub Production Deployment Verification
echo ===========================================
echo.

REM Test 1: Backend Health Check
echo [1/4] Testing Backend Health Check...
echo Testing: https://food-ordering-system-x6mu.onrender.com/
timeout /t 1 >nul
start https://food-ordering-system-x6mu.onrender.com/
echo ✓ Opened in browser

REM Wait for user
timeout /t 3 >nul
echo.

REM Test 2: Backend API Restaurants Endpoint
echo [2/4] Testing Restaurant API Endpoint...
echo Testing: https://food-ordering-system-x6mu.onrender.com/api/hotels
timeout /t 1 >nul
start https://food-ordering-system-x6mu.onrender.com/api/hotels
echo ✓ Opened in browser

REM Wait for user
timeout /t 3 >nul
echo.

REM Test 3: Frontend Homepage
echo [3/4] Testing Frontend Application...
echo Testing: https://food-ordering-system.vercel.app
timeout /t 1 >nul
start https://food-ordering-system.vercel.app
echo ✓ Opened in browser

REM Test 4: Check Dev Console
echo.
echo [4/4] Checking Browser Console...
echo.
echo ========================================
echo VERIFICATION CHECKLIST
echo ========================================
echo.
echo When the pages load, verify:
echo.
echo Backend Health (/):
echo   [ ] See JSON: {"message":"Food Ordering API is running"}
echo.
echo Restaurant API (/api/hotels):
echo   [ ] See array with 5 objects
echo   [ ] Each has "name", "cuisine", "rating", "approved": true
echo.
echo Frontend (https://food-ordering-system.vercel.app):
echo   [ ] Page loads without errors
echo   [ ] See "Popular Restaurants" heading
echo   [ ] Shows "5 results" counter
echo   [ ] 5 restaurant cards display (Midnight Munchies, Bombay Biryani House, etc.)
echo   [ ] Category filters work
echo.
echo Browser Console (F12 -> Console):
echo   [ ] No red errors
echo   [ ] No CORS warnings
echo   [ ] No "Failed to fetch" messages
echo.
echo Network Tab (F12 -> Network):
echo   [ ] Request to /api/hotels goes to: food-ordering-system-x6mu.onrender.com
echo   [ ] Response status: 200 OK
echo   [ ] Response shows 5 restaurants in JSON
echo.
echo ========================================
echo.
echo If all checks pass: ✅ DEPLOYMENT SUCCESSFUL
echo If any fail: Check PRODUCTION_DEBUG_GUIDE.md for troubleshooting
echo.
pause
