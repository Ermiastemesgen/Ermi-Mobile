const fs = require('fs');
const path = require('path');

console.log('🌐 AUTOMATIC RENDER DEPLOYMENT');
console.log('==============================');

function createRenderAutoDeployScript() {
    console.log('\n📄 Creating automatic Render deployment script...');
    
    const renderDeployBat = `@echo off
title Ermi Mobile - Automatic Render Deployment
color 0A

cls
echo.
echo ████████████████████████████████████████████████████████████
echo █                                                          █
echo █    🌐 ERMI MOBILE - RENDER AUTO DEPLOYMENT 🌐           █
echo █                                                          █
echo ████████████████████████████████████████████████████████████
echo.

echo 🚀 Automatic deployment to Render.com
echo.
echo 📋 What this script will do:
echo ✅ Prepare all deployment files
echo ✅ Set up Git repository
echo ✅ Create Render configuration
echo ✅ Initialize GitHub repository
echo ✅ Provide deployment instructions
echo.

set /p confirm="Ready to deploy to Render? (y/n): "
if /i not "%confirm%"=="y" goto cancel

echo.
echo 🔧 PREPARING RENDER DEPLOYMENT...
echo =================================

echo 📦 Step 1: Creating package.json...
echo {> package.json
echo   "name": "ermi-mobile",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Ermi Mobile - Quality Mobile Accessories Store",>> package.json
echo   "main": "server.js",>> package.json
echo   "scripts": {>> package.json
echo     "start": "node server.js",>> package.json
echo     "build": "echo 'Build completed'",>> package.json
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

echo 🌐 Step 2: Creating render.yaml...
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
echo       - key: PORT>> render.yaml
echo         value: 10000>> render.yaml
echo ✅ render.yaml created

echo 🐳 Step 3: Creating Dockerfile...
echo FROM node:18-alpine> Dockerfile
echo.>> Dockerfile
echo WORKDIR /app>> Dockerfile
echo.>> Dockerfile
echo # Copy package files>> Dockerfile
echo COPY package*.json ./>> Dockerfile
echo.>> Dockerfile
echo # Install dependencies>> Dockerfile
echo RUN npm install --production>> Dockerfile
echo.>> Dockerfile
echo # Copy application code>> Dockerfile
echo COPY . .>> Dockerfile
echo.>> Dockerfile
echo # Create uploads directory>> Dockerfile
echo RUN mkdir -p uploads>> Dockerfile
echo.>> Dockerfile
echo # Expose port>> Dockerfile
echo EXPOSE 10000>> Dockerfile
echo.>> Dockerfile
echo # Start the application>> Dockerfile
echo CMD ["npm", "start"]>> Dockerfile
echo ✅ Dockerfile created

echo 📝 Step 4: Creating .gitignore...
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
echo deploy-*.bat>> .gitignore
echo *.bat>> .gitignore
echo *.sh>> .gitignore
echo ✅ .gitignore created

echo 🔧 Step 5: Creating .env.example...
echo # Ermi Mobile Environment Variables> .env.example
echo PORT=10000>> .env.example
echo NODE_ENV=production>> .env.example
echo DATABASE_PATH=./emobile.db>> .env.example
echo.>> .env.example
echo # Render Configuration>> .env.example
echo RENDER=true>> .env.example
echo.>> .env.example
echo # Cloudinary Configuration ^(Optional^)>> .env.example
echo CLOUDINARY_CLOUD_NAME=your_cloud_name>> .env.example
echo CLOUDINARY_API_KEY=your_api_key>> .env.example
echo CLOUDINARY_API_SECRET=your_api_secret>> .env.example
echo.>> .env.example
echo # Email Configuration ^(Optional^)>> .env.example
echo EMAIL_USER=your_email@gmail.com>> .env.example
echo EMAIL_PASS=your_app_password>> .env.example
echo ✅ .env.example created

echo 📁 Step 6: Setting up uploads directory...
if not exist uploads mkdir uploads
echo # This file keeps the uploads directory in Git> uploads/.gitkeep
echo ✅ uploads directory ready

echo 🔧 Step 7: Initializing Git repository...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found! Please install Git first:
    echo https://git-scm.com/download/win
    pause
    goto end
)

if not exist .git (
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

echo 📤 Step 8: Adding files to Git...
git add .
git commit -m "Ermi Mobile - Ready for Render deployment" >nul 2>&1
echo ✅ Files committed to Git

echo.
echo ========================================
echo    🎉 RENDER DEPLOYMENT READY! 🎉
echo ========================================
echo.

echo 🌐 DEPLOY TO RENDER NOW:
echo.
echo 📋 AUTOMATIC DEPLOYMENT STEPS:
echo.
echo 1️⃣  CREATE GITHUB REPOSITORY:
echo    • Go to: https://github.com/new
echo    • Repository name: ermi-mobile
echo    • Make it PUBLIC
echo    • Don't initialize with README
echo    • Click "Create repository"
echo.
echo 2️⃣  PUSH TO GITHUB:
echo    Copy and run these commands:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3️⃣  DEPLOY ON RENDER:
echo    • Go to: https://render.com
echo    • Sign up/Login with GitHub
echo    • Click "New +" button
echo    • Select "Web Service"
echo    • Connect your GitHub repository
echo    • Select "ermi-mobile" repository
echo    • Settings will be auto-detected!
echo    • Click "Create Web Service"
echo.
echo 4️⃣  YOUR STORE WILL BE LIVE AT:
echo    https://ermi-mobile.onrender.com
echo.
echo 📱 ADMIN ACCESS:
echo    URL: https://ermi-mobile.onrender.com/admin.html
echo    Email: ermias616@gmail.com
echo    Password: Ermi@0211
echo.
echo 🎯 FEATURES INCLUDED:
echo    ✅ User authentication system
echo    ✅ Product catalog with images
echo    ✅ Shopping cart functionality
echo    ✅ Admin panel for management
echo    ✅ Responsive design
echo    ✅ SQLite database
echo    ✅ Image upload support
echo    ✅ Order management
echo.
echo 🔧 RENDER CONFIGURATION:
echo    ✅ Free tier (750 hours/month)
echo    ✅ Automatic SSL certificate
echo    ✅ Global CDN
echo    ✅ Auto-deploy on Git push
echo    ✅ Environment variables ready
echo.
echo 📝 Replace YOUR_USERNAME with your GitHub username
echo.
echo 🚀 Your Ermi Mobile store is ready for the world!
echo.
pause
goto end

:cancel
echo.
echo ❌ Deployment cancelled.
echo.
pause

:end
echo.
echo 👋 Thank you for using Ermi Mobile Auto Deploy!
echo.
`;
    
    try {
        fs.writeFileSync(path.join(__dirname, 'deploy-render-auto.bat'), renderDeployBat);
        console.log('✅ Created deploy-render-auto.bat');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

function createRenderQuickDeploy() {
    console.log('\n📄 Creating Render quick deploy script...');
    
    const quickDeploy = `@echo off
title Render Quick Deploy - Ermi Mobile
color 0E

echo.
echo ⚡ RENDER QUICK DEPLOY ⚡
echo =======================
echo.
echo 🚀 One-click deployment to Render!
echo.

echo 🔧 Preparing files...

REM Create optimized package.json for Render
echo {> package.json
echo   "name": "ermi-mobile",>> package.json
echo   "version": "1.0.0",>> package.json
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

REM Create render.yaml
echo services:> render.yaml
echo   - type: web>> render.yaml
echo     name: ermi-mobile>> render.yaml
echo     env: node>> render.yaml
echo     plan: free>> render.yaml
echo     buildCommand: npm install>> render.yaml
echo     startCommand: npm start>> render.yaml

REM Setup Git
git init >nul 2>&1
git add . >nul 2>&1
git commit -m "Ready for Render" >nul 2>&1

echo ✅ Files ready!
echo.
echo 🌐 DEPLOY NOW:
echo 1. Go to: https://render.com
echo 2. New Web Service → Connect GitHub
echo 3. Your store will be live!
echo.
echo 📱 Live URL: https://ermi-mobile.onrender.com
echo.
pause
`;
    
    try {
        fs.writeFileSync(path.join(__dirname, 'render-quick-deploy.bat'), quickDeploy);
        console.log('✅ Created render-quick-deploy.bat');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

function createRenderConfigFiles() {
    console.log('\n📄 Creating Render configuration files...');
    
    // Update render.yaml with optimized settings
    const renderYaml = `services:
  - type: web
    name: ermi-mobile
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: RENDER
        value: true
      - key: PORT
        value: 10000
    healthCheckPath: /
    autoDeploy: true`;
    
    try {
        fs.writeFileSync(path.join(__dirname, 'render.yaml'), renderYaml);
        console.log('✅ Updated render.yaml');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
    
    // Create optimized package.json for Render
    const packageJson = {
        "name": "ermi-mobile",
        "version": "1.0.0",
        "description": "Ermi Mobile - Quality Mobile Accessories Store",
        "main": "server.js",
        "scripts": {
            "start": "node server.js",
            "build": "echo 'Build completed'",
            "dev": "node server.js"
        },
        "dependencies": {
            "express": "^4.18.2",
            "sqlite3": "^5.1.6",
            "bcrypt": "^5.1.0",
            "cors": "^2.8.5",
            "body-parser": "^1.20.2",
            "multer": "^1.4.5-lts.1",
            "dotenv": "^16.3.1",
            "nodemailer": "^6.9.4",
            "cloudinary": "^1.40.0",
            "multer-storage-cloudinary": "^4.0.0"
        },
        "engines": {
            "node": ">=18.0.0"
        },
        "keywords": ["mobile", "accessories", "ecommerce", "store"],
        "author": "Ermias",
        "license": "MIT"
    };
    
    try {
        fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(packageJson, null, 2));
        console.log('✅ Updated package.json');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

function createGitSetup() {
    console.log('\n📄 Creating Git setup for Render...');
    
    const gitSetup = `@echo off
title Git Setup for Render - Ermi Mobile
color 0B

echo.
echo 📁 GIT SETUP FOR RENDER DEPLOYMENT
echo ==================================
echo.

echo 🔧 Setting up Git repository...

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found!
    echo.
    echo 📥 Please install Git:
    echo https://git-scm.com/download/win
    echo.
    pause
    exit
)

REM Initialize Git if not exists
if not exist .git (
    echo 📁 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

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

REM Add and commit files
echo 📤 Adding files to Git...
git add .
git commit -m "Ermi Mobile - Ready for Render deployment"

echo.
echo ✅ GIT SETUP COMPLETE!
echo.
echo 📋 Next steps:
echo 1. Create GitHub repository: https://github.com/new
echo 2. Name it: ermi-mobile
echo 3. Run: git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git
echo 4. Run: git push -u origin main
echo 5. Deploy on Render: https://render.com
echo.
pause
`;
    
    try {
        fs.writeFileSync(path.join(__dirname, 'git-setup-render.bat'), gitSetup);
        console.log('✅ Created git-setup-render.bat');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

console.log('🎯 Creating Render automatic deployment system...');
createRenderAutoDeployScript();
createRenderQuickDeploy();
createRenderConfigFiles();
createGitSetup();

console.log('\n🎉 RENDER AUTO DEPLOYMENT READY!');
console.log('=================================');
console.log('✅ deploy-render-auto.bat - Complete Render deployment');
console.log('✅ render-quick-deploy.bat - Quick deployment');
console.log('✅ git-setup-render.bat - Git repository setup');
console.log('✅ render.yaml - Render configuration');
console.log('✅ package.json - Updated for Render');
console.log('');
console.log('🚀 Run deploy-render-auto.bat to start automatic deployment!');