@echo off
echo ========================================
echo PodDB GitHub Pages Deployment Script
echo ========================================
echo.

echo Step 1: Checking Git status...
git status

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=Deploy PodDB to GitHub Pages

git commit -m "%commit_message%"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Deployment initiated successfully!
echo ========================================
echo.
echo Your app will be available at:
echo https://ksrathorefanpage-spec.github.io/dev-collaborate-space
echo.
echo Check deployment status at:
echo https://github.com/ksrathorefanpage-spec/dev-collaborate-space/actions
echo.
echo Press any key to exit...
pause > nul
