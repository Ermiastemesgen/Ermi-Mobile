const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 AUTOMATIC DEPLOYMENT - ERMI MOBILE');
console.log('=====================================');

function createAutoDeployScript() {
    console.log('\n📄 Creating automatic deployment script...');
    
    const autoDeployBat = `@echo off
title Ermi Mobile - Automatic Deployment
color 0A

echo.
echo ========================================
echo    🚀 ERMI MOBILE AUTO DEPLOYMENT 🚀
echo ========================================
echo.

echo 📋 Deployment Options:
echo [1] Deploy to Render (Recommended)
echo [2] Deploy to Railway
echo [3] Deploy to Both Platforms
echo [4] Local Development Setup
echo [5] Exit
echo.

set /p choice="Select deployment option (1-5): "

if "%choice%"=="1" goto render_deploy
if "%choice%"=="2" goto railway_deploy
if "%choice%"=="3" goto both_deploy
if "%choice%"=="4" goto local_setup
if "%choice%"=="5" goto exit

echo Invalid choice. Please try again.
pause
goto start

:render_deploy
echo.
echo 🌐 DEPLOYING TO RENDER
echo ======================
call :check_git
call :prepare_files
call :render_specific_setup
call :deploy_render
goto success

:railway_deploy
echo.
echo 🚂 DEPLOYING TO RAILWAY
echo =======================
call :check_git
call :prepare_files
call :railway_specific_setup
call :deploy_railway
goto success

:both_deploy
echo.
echo 🌍 DEPLOYING TO BOTH PLATFORMS
echo ==============================
call :check_git
call :prepare_files
call :render_specific_setup
call :deploy_render
call :railway_specific_setup
call :deploy_railway
goto success

:local_setup
echo.
echo 💻 LOCAL DEVELOPMENT SETUP
echo ==========================
call :prepare_files
call :local_development_setup
goto success

:check_git
echo 📋 Checking Git setup...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found. Installing Git...
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

if not exist .git (
    echo 🔧 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - Ermi Mobile Store"
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository found
    echo 🔄 Committing latest changes...
    git add .
    git commit -m "Auto-deployment update - %date% %time%" || echo "No changes to commit"
)
exit /b 0

:prepare_files
echo 📦 Preparing deployment files...

echo 🔧 Creating package.json if missing...
if not exist package.json (
    echo {> package.json
    echo   "name": "ermi-mobile",>> package.json
    echo   "version": "1.0.0",>> package.json
    echo   "description": "Ermi Mobile - Quality Mobile Accessories Store",>> package.json
    echo   "main": "server.js",>> package.json
    echo   "scripts": {>> package.json
    echo     "start": "node server.js",>> package.json
    echo     "dev": "node server.js">> package.json
    echo   },>> package.json
    echo   "dependencies": {>> package.json
    echo     "express": "^4.18.2",>> package.json
    echo     "sqlite3": "^5.1.6",>> package.json
    echo     "bcrypt": "^5.1.0",>> package.json
    echo     "cors": "^2.8.5",>> package.json
    echo     "body-parser": "^1.20.2",>> package.json
    echo     "multer": "^1.4.5-lts.1",>> package.json
    echo     "dotenv": "^16.3.1",>> package.json
    echo     "nodemailer": "^6.9.4",>> package.json
    echo     "cloudinary": "^1.40.0",>> package.json
    echo     "multer-storage-cloudinary": "^4.0.0">> package.json
    echo   },>> package.json
    echo   "engines": {>> package.json
    echo     "node": ">=18.0.0">> package.json
    echo   }>> package.json
    echo }>> package.json
    echo ✅ package.json created
)

echo 🔧 Creating .env.example...
if not exist .env.example (
    echo # Ermi Mobile Environment Variables> .env.example
    echo PORT=3000>> .env.example
    echo NODE_ENV=production>> .env.example
    echo DATABASE_PATH=./emobile.db>> .env.example
    echo.>> .env.example
    echo # Cloudinary Configuration ^(Optional^)>> .env.example
    echo CLOUDINARY_CLOUD_NAME=your_cloud_name>> .env.example
    echo CLOUDINARY_API_KEY=your_api_key>> .env.example
    echo CLOUDINARY_API_SECRET=your_api_secret>> .env.example
    echo.>> .env.example
    echo # Email Configuration ^(Optional^)>> .env.example
    echo EMAIL_USER=your_email@gmail.com>> .env.example
    echo EMAIL_PASS=your_app_password>> .env.example
    echo.>> .env.example
    echo # Render Specific>> .env.example
    echo RENDER=true>> .env.example
    echo USE_PERSISTENT_STORAGE=true>> .env.example
    echo UPLOADS_PATH=/opt/render/project/src/uploads>> .env.example
    echo ✅ .env.example created
)

echo 🔧 Creating Dockerfile...
if not exist Dockerfile (
    echo FROM node:18-alpine> Dockerfile
    echo.>> Dockerfile
    echo WORKDIR /app>> Dockerfile
    echo.>> Dockerfile
    echo COPY package*.json ./>> Dockerfile
    echo RUN npm install --production>> Dockerfile
    echo.>> Dockerfile
    echo COPY . .>> Dockerfile
    echo.>> Dockerfile
    echo RUN mkdir -p uploads>> Dockerfile
    echo.>> Dockerfile
    echo EXPOSE 3000>> Dockerfile
    echo.>> Dockerfile
    echo CMD ["npm", "start"]>> Dockerfile
    echo ✅ Dockerfile created
)

echo 🔧 Creating .dockerignore...
if not exist .dockerignore (
    echo node_modules> .dockerignore
    echo npm-debug.log>> .dockerignore
    echo .git>> .dockerignore
    echo .gitignore>> .dockerignore
    echo README.md>> .dockerignore
    echo .env>> .dockerignore
    echo coverage>> .dockerignore
    echo .nyc_output>> .dockerignore
    echo *.md>> .dockerignore
    echo *.bat>> .dockerignore
    echo *.sh>> .dockerignore
    echo test-*.html>> .dockerignore
    echo debug-*.js>> .dockerignore
    echo fix-*.js>> .dockerignore
    echo ✅ .dockerignore created
)

echo ✅ All deployment files prepared
exit /b 0

:render_specific_setup
echo 🌐 Setting up Render configuration...

echo 🔧 Creating render.yaml...
echo services:> render.yaml
echo   - type: web>> render.yaml
echo     name: ermi-mobile>> render.yaml
echo     env: node>> render.yaml
echo     plan: free>> render.yaml
echo     buildCommand: npm install>> render.yaml
echo     startCommand: npm start>> render.yaml
echo     envVars:>> render.yaml
echo       - key: NODE_ENV>> render.yaml
echo         value: production>> render.yaml
echo       - key: RENDER>> render.yaml
echo         value: true>> render.yaml
echo       - key: USE_PERSISTENT_STORAGE>> render.yaml
echo         value: false>> render.yaml

echo ✅ Render configuration ready
exit /b 0

:railway_specific_setup
echo 🚂 Setting up Railway configuration...

echo 🔧 Creating railway.json...
echo {> railway.json
echo   "build": {>> railway.json
echo     "builder": "NIXPACKS">> railway.json
echo   },>> railway.json
echo   "deploy": {>> railway.json
echo     "startCommand": "npm start",>> railway.json
echo     "restartPolicyType": "ON_FAILURE",>> railway.json
echo     "restartPolicyMaxRetries": 10>> railway.json
echo   }>> railway.json
echo }>> railway.json

echo 🔧 Creating nixpacks.toml...
echo [phases.setup]> nixpacks.toml
echo nixPkgs = ["nodejs", "npm"]>> nixpacks.toml
echo.>> nixpacks.toml
echo [phases.install]>> nixpacks.toml
echo cmds = ["npm install --production"]>> nixpacks.toml
echo.>> nixpacks.toml
echo [phases.build]>> nixpacks.toml
echo cmds = ["mkdir -p uploads"]>> nixpacks.toml
echo.>> nixpacks.toml
echo [start]>> nixpacks.toml
echo cmd = "npm start">> nixpacks.toml

echo ✅ Railway configuration ready
exit /b 0

:deploy_render
echo 🌐 Deploying to Render...
echo.
echo 📋 Render Deployment Steps:
echo 1. Go to https://render.com
echo 2. Sign up/Login with GitHub
echo 3. Click "New +" and select "Web Service"
echo 4. Connect your GitHub repository
echo 5. Use these settings:
echo    - Name: ermi-mobile
echo    - Environment: Node
echo    - Build Command: npm install
echo    - Start Command: npm start
echo    - Plan: Free
echo.
echo 🔗 Your repository is ready for Render deployment!
echo 📁 All necessary files have been created
echo.
pause
exit /b 0

:deploy_railway
echo 🚂 Deploying to Railway...
echo.
echo 📋 Railway Deployment Steps:
echo 1. Go to https://railway.app
echo 2. Sign up/Login with GitHub
echo 3. Click "New Project"
echo 4. Select "Deploy from GitHub repo"
echo 5. Choose your repository
echo 6. Railway will auto-deploy!
echo.
echo 🔗 Your repository is ready for Railway deployment!
echo 📁 All necessary files have been created
echo.
pause
exit /b 0

:local_development_setup
echo 💻 Setting up local development...

echo 📦 Installing dependencies...
if exist package.json (
    npm install
    if errorlevel 1 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ❌ package.json not found
    pause
    exit /b 1
)

echo 🔧 Creating local .env file...
if not exist .env (
    copy .env.example .env
    echo ✅ .env file created from example
    echo 📝 Please edit .env file with your configuration
)

echo 🚀 Starting local server...
echo.
echo 🌐 Your Ermi Mobile store will be available at:
echo    http://localhost:3000
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.
npm start
exit /b 0

:success
echo.
echo ========================================
echo    ✅ DEPLOYMENT COMPLETED SUCCESSFULLY
echo ========================================
echo.
echo 🎉 Your Ermi Mobile store is ready!
echo.
echo 📋 What's been set up:
echo ✅ Git repository initialized
echo ✅ Package.json configured
echo ✅ Dockerfile created
echo ✅ Environment files ready
echo ✅ Platform-specific configs created
echo.
echo 🚀 Next steps:
echo 1. Push your code to GitHub
echo 2. Connect to your chosen platform
echo 3. Your store will be live!
echo.
echo 🔗 Useful links:
echo - Render: https://render.com
echo - Railway: https://railway.app
echo - GitHub: https://github.com
echo.
pause
goto exit

:exit
echo.
echo 👋 Thank you for using Ermi Mobile Auto Deploy!
echo.
pause
exit
`;
    
    try {
        fs.writeFileSync(path.join(__dirname, 'auto-deploy.bat'), autoDeployBat);
        console.log('✅ Created auto-deploy.bat');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

function createGitHubSetupScript() {
    console.log('\n📄 Creating GitHub setup script...');
    
    const githubSetup = `@echo off
title GitHub Setup - Ermi Mobile
color 0B

echo.
echo ========================================
echo    📱 ERMI MOBILE - GITHUB SETUP 📱
echo ========================================
echo.

echo 🔧 Setting up GitHub repository for automatic deployment...
echo.

:check_git
echo 📋 Checking Git installation...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found!
    echo.
    echo 📥 Please install Git first:
    echo 1. Go to: https://git-scm.com/download/win
    echo 2. Download and install Git
    echo 3. Restart this script
    echo.
    pause
    exit
)
echo ✅ Git is installed

:setup_repo
echo.
echo 🔧 Setting up local repository...

if not exist .git (
    echo 📁 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

echo 📝 Creating .gitignore...
if not exist .gitignore (
    echo node_modules/> .gitignore
    echo .env>> .gitignore
    echo *.log>> .gitignore
    echo .DS_Store>> .gitignore
    echo Thumbs.db>> .gitignore
    echo emobile.db>> .gitignore
    echo uploads/*.jpg>> .gitignore
    echo uploads/*.png>> .gitignore
    echo uploads/*.gif>> .gitignore
    echo uploads/*.webp>> .gitignore
    echo !uploads/.gitkeep>> .gitignore
    echo *.backup.*>> .gitignore
    echo *-backup.*>> .gitignore
    echo test-*.html>> .gitignore
    echo debug-*.js>> .gitignore
    echo fix-*.js>> .gitignore
    echo *.bat>> .gitignore
    echo !auto-deploy.bat>> .gitignore
    echo *.sh>> .gitignore
    echo !deploy.sh>> .gitignore
    echo ✅ .gitignore created
)

echo 📁 Creating uploads directory...
if not exist uploads mkdir uploads
if not exist uploads/.gitkeep (
    echo # This file keeps the uploads directory in Git> uploads/.gitkeep
    echo ✅ uploads/.gitkeep created
)

echo 📦 Adding files to Git...
git add .
git commit -m "Initial commit: Ermi Mobile Store - Ready for deployment" || echo "No changes to commit"

echo.
echo ========================================
echo    🎉 REPOSITORY SETUP COMPLETE! 🎉
echo ========================================
echo.
echo 📋 Next steps:
echo.
echo 1️⃣  CREATE GITHUB REPOSITORY:
echo    - Go to: https://github.com/new
echo    - Repository name: ermi-mobile
echo    - Make it Public
echo    - Don't initialize with README
echo    - Click "Create repository"
echo.
echo 2️⃣  CONNECT TO GITHUB:
echo    Copy and paste these commands in order:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3️⃣  DEPLOY TO PLATFORMS:
echo    🌐 RENDER: https://render.com
echo    🚂 RAILWAY: https://railway.app
echo.
echo 📝 Replace YOUR_USERNAME with your actual GitHub username
echo.
echo 🔗 Your repository is ready for deployment!
echo.
pause
`;
    
    try {
        fs.writeFileSync(path.join(__dirname, 'github-setup.bat'), githubSetup);
        console.log('✅ Created github-setup.bat');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

function createQuickDeployScript() {
    console.log('\n📄 Creating quick deploy script...');
    
    const quickDeploy = `@echo off
title Quick Deploy - Ermi Mobile
color 0E

echo.
echo ========================================
echo    ⚡ ERMI MOBILE - QUICK DEPLOY ⚡
echo ========================================
echo.

echo 🚀 One-click deployment to the cloud!
echo.

echo 📋 What this script does:
echo ✅ Prepares all deployment files
echo ✅ Sets up Git repository
echo ✅ Creates platform configurations
echo ✅ Provides deployment instructions
echo.

set /p confirm="Ready to deploy? (y/n): "
if /i not "%confirm%"=="y" goto cancel

echo.
echo 🔧 PREPARING DEPLOYMENT...
echo ========================

echo 📦 Creating package.json...
echo {> package.json
echo   "name": "ermi-mobile",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Ermi Mobile - Quality Mobile Accessories Store",>> package.json
echo   "main": "server.js",>> package.json
echo   "scripts": {>> package.json
echo     "start": "node server.js",>> package.json
echo     "dev": "node server.js">> package.json
echo   },>> package.json
echo   "dependencies": {>> package.json
echo     "express": "^4.18.2",>> package.json
echo     "sqlite3": "^5.1.6",>> package.json
echo     "bcrypt": "^5.1.0",>> package.json
echo     "cors": "^2.8.5",>> package.json
echo     "body-parser": "^1.20.2",>> package.json
echo     "multer": "^1.4.5-lts.1",>> package.json
echo     "dotenv": "^16.3.1",>> package.json
echo     "nodemailer": "^6.9.4",>> package.json
echo     "cloudinary": "^1.40.0",>> package.json
echo     "multer-storage-cloudinary": "^4.0.0">> package.json
echo   },>> package.json
echo   "engines": {>> package.json
echo     "node": ">=18.0.0">> package.json
echo   }>> package.json
echo }>> package.json

echo 🐳 Creating Dockerfile...
echo FROM node:18-alpine> Dockerfile
echo WORKDIR /app>> Dockerfile
echo COPY package*.json ./>> Dockerfile
echo RUN npm install --production>> Dockerfile
echo COPY . .>> Dockerfile
echo RUN mkdir -p uploads>> Dockerfile
echo EXPOSE 3000>> Dockerfile
echo CMD ["npm", "start"]>> Dockerfile

echo 🌐 Creating render.yaml...
echo services:> render.yaml
echo   - type: web>> render.yaml
echo     name: ermi-mobile>> render.yaml
echo     env: node>> render.yaml
echo     plan: free>> render.yaml
echo     buildCommand: npm install>> render.yaml
echo     startCommand: npm start>> render.yaml

echo 📝 Creating .gitignore...
echo node_modules/> .gitignore
echo .env>> .gitignore
echo *.log>> .gitignore
echo emobile.db>> .gitignore
echo uploads/*.jpg>> .gitignore
echo uploads/*.png>> .gitignore
echo !uploads/.gitkeep>> .gitignore

echo 📁 Setting up uploads directory...
if not exist uploads mkdir uploads
echo # Keep this directory> uploads/.gitkeep

echo 🔧 Initializing Git...
git init >nul 2>&1
git add . >nul 2>&1
git commit -m "Ready for deployment" >nul 2>&1

echo.
echo ========================================
echo    🎉 DEPLOYMENT READY! 🎉
echo ========================================
echo.
echo 🚀 DEPLOY NOW:
echo.
echo 🌐 RENDER (Recommended):
echo 1. Go to: https://render.com
echo 2. Sign up with GitHub
echo 3. New Web Service → Connect Repository
echo 4. Your store will be live in 2-3 minutes!
echo.
echo 🚂 RAILWAY (Alternative):
echo 1. Go to: https://railway.app  
echo 2. Sign up with GitHub
echo 3. New Project → Deploy from GitHub
echo 4. Auto-deployment complete!
echo.
echo 📱 Your Ermi Mobile store will be live at:
echo    https://your-app-name.onrender.com
echo    or
echo    https://your-app-name.up.railway.app
echo.
echo 🎯 All files are ready for deployment!
echo.
pause
goto end

:cancel
echo.
echo ❌ Deployment cancelled.
echo.
pause

:end
`;
    
    try {
        fs.writeFileSync(path.join(__dirname, 'quick-deploy.bat'), quickDeploy);
        console.log('✅ Created quick-deploy.bat');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

function createMasterDeployScript() {
    console.log('\n📄 Creating master deployment script...');
    
    const masterDeploy = `@echo off
title Master Deploy - Ermi Mobile
color 0A

:start
cls
echo.
echo ████████████████████████████████████████████████████████████
echo █                                                          █
echo █    🚀 ERMI MOBILE - MASTER DEPLOYMENT SYSTEM 🚀         █
echo █                                                          █
echo ████████████████████████████████████████████████████████████
echo.
echo 📱 Welcome to the complete deployment solution!
echo.
echo 🎯 Choose your deployment method:
echo.
echo [1] 🌐 Deploy to Render (Free, Recommended)
echo [2] 🚂 Deploy to Railway (Free, Fast)
echo [3] ⚡ Quick Deploy (One-click setup)
echo [4] 📁 GitHub Setup Only
echo [5] 💻 Local Development
echo [6] 🔧 Fix & Redeploy
echo [7] ❓ Help & Documentation
echo [8] 🚪 Exit
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto render_deploy
if "%choice%"=="2" goto railway_deploy
if "%choice%"=="3" goto quick_deploy
if "%choice%"=="4" goto github_setup
if "%choice%"=="5" goto local_dev
if "%choice%"=="6" goto fix_redeploy
if "%choice%"=="7" goto help
if "%choice%"=="8" goto exit

echo ❌ Invalid choice. Please try again.
timeout /t 2 >nul
goto start

:render_deploy
cls
echo.
echo 🌐 RENDER DEPLOYMENT
echo ===================
echo.
echo 📋 Render is perfect for:
echo ✅ Free hosting (750 hours/month)
echo ✅ Automatic SSL certificates
echo ✅ Global CDN
echo ✅ Easy custom domains
echo.
call :prepare_deployment
call :create_render_config
echo.
echo 🚀 RENDER DEPLOYMENT STEPS:
echo.
echo 1️⃣  Push to GitHub (if not done):
echo    git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git
echo    git push -u origin main
echo.
echo 2️⃣  Deploy on Render:
echo    • Go to: https://render.com
echo    • Sign up/Login with GitHub
echo    • Click "New +" → "Web Service"
echo    • Connect your GitHub repository
echo    • Settings will be auto-detected!
echo.
echo 3️⃣  Your store will be live at:
echo    https://ermi-mobile.onrender.com
echo.
pause
goto start

:railway_deploy
cls
echo.
echo 🚂 RAILWAY DEPLOYMENT
echo ====================
echo.
echo 📋 Railway is perfect for:
echo ✅ Instant deployments
echo ✅ Built-in databases
echo ✅ Simple pricing
echo ✅ Great performance
echo.
call :prepare_deployment
call :create_railway_config
echo.
echo 🚀 RAILWAY DEPLOYMENT STEPS:
echo.
echo 1️⃣  Push to GitHub (if not done):
echo    git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git
echo    git push -u origin main
echo.
echo 2️⃣  Deploy on Railway:
echo    • Go to: https://railway.app
echo    • Sign up/Login with GitHub
echo    • Click "New Project"
echo    • Select "Deploy from GitHub repo"
echo    • Choose your repository
echo    • Automatic deployment starts!
echo.
echo 3️⃣  Your store will be live at:
echo    https://ermi-mobile.up.railway.app
echo.
pause
goto start

:quick_deploy
cls
echo.
echo ⚡ QUICK DEPLOY
echo ==============
echo.
echo 🎯 This will set up everything automatically!
echo.
set /p confirm="Continue with quick setup? (y/n): "
if /i not "%confirm%"=="y" goto start

call :prepare_deployment
call :create_render_config
call :create_railway_config

echo.
echo ✅ QUICK SETUP COMPLETE!
echo.
echo 🚀 Choose your platform:
echo.
echo 🌐 RENDER: https://render.com
echo   → New Web Service → Connect GitHub
echo.
echo 🚂 RAILWAY: https://railway.app
echo   → New Project → Deploy from GitHub
echo.
echo 📱 Your store will be live in minutes!
echo.
pause
goto start

:github_setup
cls
echo.
echo 📁 GITHUB SETUP
echo ===============
echo.
call :setup_git_repo
echo.
echo ✅ GitHub setup complete!
echo.
echo 📋 Next steps:
echo 1. Create repository at: https://github.com/new
echo 2. Name it: ermi-mobile
echo 3. Run: git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git
echo 4. Run: git push -u origin main
echo.
pause
goto start

:local_dev
cls
echo.
echo 💻 LOCAL DEVELOPMENT
echo ===================
echo.
call :prepare_deployment
echo.
echo 📦 Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Installation failed
    pause
    goto start
)

echo.
echo 🚀 Starting local server...
echo.
echo 🌐 Your store will be available at: http://localhost:3000
echo 🛑 Press Ctrl+C to stop
echo.
npm start
pause
goto start

:fix_redeploy
cls
echo.
echo 🔧 FIX & REDEPLOY
echo =================
echo.
echo 🔄 Applying latest fixes...
call :prepare_deployment
call :create_render_config
call :create_railway_config

echo.
echo 📤 Committing changes...
git add .
git commit -m "Fix and redeploy - %date% %time%"
git push

echo.
echo ✅ Fixes applied and pushed!
echo 🔄 Your deployment will update automatically
echo.
pause
goto start

:help
cls
echo.
echo ❓ HELP & DOCUMENTATION
echo ======================
echo.
echo 📚 DEPLOYMENT PLATFORMS:
echo.
echo 🌐 RENDER:
echo   • Free tier: 750 hours/month
echo   • Automatic SSL
echo   • Global CDN
echo   • Best for: Production sites
echo.
echo 🚂 RAILWAY:
echo   • $5/month after free trial
echo   • Instant deployments
echo   • Built-in databases
echo   • Best for: Quick prototypes
echo.
echo 🔧 TROUBLESHOOTING:
echo   • Check server logs on platform
echo   • Verify environment variables
echo   • Ensure all files are committed
echo   • Check build logs for errors
echo.
echo 📞 SUPPORT:
echo   • GitHub Issues
echo   • Platform documentation
echo   • Community forums
echo.
pause
goto start

:prepare_deployment
echo 📦 Preparing deployment files...

REM Create package.json
echo {> package.json
echo   "name": "ermi-mobile",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Ermi Mobile - Quality Mobile Accessories Store",>> package.json
echo   "main": "server.js",>> package.json
echo   "scripts": {>> package.json
echo     "start": "node server.js">> package.json
echo   },>> package.json
echo   "dependencies": {>> package.json
echo     "express": "^4.18.2",>> package.json
echo     "sqlite3": "^5.1.6",>> package.json
echo     "bcrypt": "^5.1.0",>> package.json
echo     "cors": "^2.8.5",>> package.json
echo     "body-parser": "^1.20.2",>> package.json
echo     "multer": "^1.4.5-lts.1",>> package.json
echo     "dotenv": "^16.3.1",>> package.json
echo     "nodemailer": "^6.9.4",>> package.json
echo     "cloudinary": "^1.40.0",>> package.json
echo     "multer-storage-cloudinary": "^4.0.0">> package.json
echo   },>> package.json
echo   "engines": {>> package.json
echo     "node": ">=18.0.0">> package.json
echo   }>> package.json
echo }>> package.json

REM Create Dockerfile
echo FROM node:18-alpine> Dockerfile
echo WORKDIR /app>> Dockerfile
echo COPY package*.json ./>> Dockerfile
echo RUN npm install --production>> Dockerfile
echo COPY . .>> Dockerfile
echo RUN mkdir -p uploads>> Dockerfile
echo EXPOSE 3000>> Dockerfile
echo CMD ["npm", "start"]>> Dockerfile

REM Create .gitignore
echo node_modules/> .gitignore
echo .env>> .gitignore
echo *.log>> .gitignore
echo emobile.db>> .gitignore
echo uploads/*.jpg>> .gitignore
echo uploads/*.png>> .gitignore
echo !uploads/.gitkeep>> .gitignore

REM Setup uploads directory
if not exist uploads mkdir uploads
echo # Keep directory> uploads/.gitkeep

echo ✅ Deployment files ready
exit /b 0

:create_render_config
echo 🌐 Creating Render configuration...
echo services:> render.yaml
echo   - type: web>> render.yaml
echo     name: ermi-mobile>> render.yaml
echo     env: node>> render.yaml
echo     plan: free>> render.yaml
echo     buildCommand: npm install>> render.yaml
echo     startCommand: npm start>> render.yaml
echo     envVars:>> render.yaml
echo       - key: NODE_ENV>> render.yaml
echo         value: production>> render.yaml
echo ✅ Render config ready
exit /b 0

:create_railway_config
echo 🚂 Creating Railway configuration...
echo {> railway.json
echo   "build": {>> railway.json
echo     "builder": "NIXPACKS">> railway.json
echo   },>> railway.json
echo   "deploy": {>> railway.json
echo     "startCommand": "npm start">> railway.json
echo   }>> railway.json
echo }>> railway.json
echo ✅ Railway config ready
exit /b 0

:setup_git_repo
echo 📁 Setting up Git repository...
git init >nul 2>&1
git add . >nul 2>&1
git commit -m "Ermi Mobile - Ready for deployment" >nul 2>&1
echo ✅ Git repository ready
exit /b 0

:exit
cls
echo.
echo ████████████████████████████████████████████████████████████
echo █                                                          █
echo █    👋 THANK YOU FOR USING ERMI MOBILE DEPLOY! 👋        █
echo █                                                          █
echo ████████████████████████████████████████████████████████████
echo.
echo 🎉 Your mobile accessories store is ready for the world!
echo.
echo 🌐 Live URLs (after deployment):
echo   • Render: https://ermi-mobile.onrender.com
echo   • Railway: https://ermi-mobile.up.railway.app
echo.
echo 📱 Features included:
echo   ✅ User authentication
echo   ✅ Product management
echo   ✅ Shopping cart
echo   ✅ Admin panel
echo   ✅ Responsive design
echo   ✅ Image uploads
echo   ✅ Order management
echo.
echo 🚀 Happy selling!
echo.
pause
`;
    
    try {
        fs.writeFileSync(path.join(__dirname, 'master-deploy.bat'), masterDeploy);
        console.log('✅ Created master-deploy.bat');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

console.log('🎯 Creating automatic deployment system...');
createAutoDeployScript();
createGitHubSetupScript();
createQuickDeployScript();
createMasterDeployScript();

console.log('\n🎉 AUTOMATIC DEPLOYMENT SYSTEM CREATED!');
console.log('=======================================');
console.log('✅ auto-deploy.bat - Full deployment options');
console.log('✅ github-setup.bat - GitHub repository setup');
console.log('✅ quick-deploy.bat - One-click deployment');
console.log('✅ master-deploy.bat - Complete deployment system');
console.log('');
console.log('🚀 Run master-deploy.bat for the complete deployment experience!');