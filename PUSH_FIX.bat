@echo off
echo ===================================================
echo     FORCING NEW DEPLOYMENT (TRIGGER)
echo ===================================================
echo.
echo [1/4] Creating trigger file...
echo %date% %time% > deploy_trigger.txt
echo.
echo [2/4] Adding files...
git add .
echo.
echo [3/4] Committing changes...
git commit -m "chore: trigger render deployment"
echo.
echo [4/4] Pushing to GitHub...
git push origin main
echo.
echo DONE! This MUST trigger a new deployment on Render.
pause
