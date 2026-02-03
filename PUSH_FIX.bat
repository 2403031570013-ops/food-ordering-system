@echo off
echo ===================================================
echo     SAVING AND PUSHING FIXES
echo ===================================================
echo.
echo [1/3] Adding files...
git add .
echo.
echo [2/3] Committing changes...
git commit -m "fix: enable google auth debugging and https"
echo.
echo [3/3] Pushing to GitHub...
git push origin main
echo.
echo DONE! Check Render Dashboard for deployment.
pause
