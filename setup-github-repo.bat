@echo off
echo ========================================
echo PodDB GitHub Repository Setup Script
echo ========================================
echo.

echo Step 1: Initializing Git repository...
git init

echo.
echo Step 2: Adding remote repository...
git remote add origin https://github.com/ksrathorefanpage-spec/dev-collaborate-space.git

echo.
echo Step 3: Setting up branch...
git branch -M main

echo.
echo Step 4: Adding all files...
git add .

echo.
echo Step 5: Initial commit...
git commit -m "Initial PodDB deployment setup"

echo.
echo Step 6: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Repository setup completed!
echo ========================================
echo.
echo Next steps:
echo 1. Go to: https://github.com/ksrathorefanpage-spec/dev-collaborate-space
echo 2. Go to Settings ^> Secrets and variables ^> Actions
echo 3. Add the required secrets (check DEPLOYMENT_GUIDE.md)
echo 4. Go to Settings ^> Pages
echo 5. Set Source to "GitHub Actions"
echo.
echo After setting up secrets, your app will be available at:
echo https://ksrathorefanpage-spec.github.io/dev-collaborate-space
echo.
echo Press any key to exit...
pause > nul
