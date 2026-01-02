const fs = require('fs');
const path = require('path');

console.log('🔄 SETTING UP AUTOMATIC DEPLOYMENT TO RENDER');
console.log('=============================================');

function createGitHubActions() {
    console.log('\n📁 Creating GitHub Actions workflow...');
    
    // Create .github/workflows directory
    const workflowDir = '.github/workflows';
    if (!fs.existsSync('.github')) {
        fs.mkdirSync('.github');
        console.log('✅ Created .github directory');
    }
    if (!fs.existsSync(workflowDir)) {
        fs.mkdirSync(workflowDir);
        console.log('✅ Created .github/workflows directory');
    }
    
    // Create auto-deploy workflow
    const workflowContent = `name: Auto Deploy to Render

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests (if any)
      run: npm test --if-present
      
    - name: Build project (if needed)
      run: npm run build --if-present
      
    - name: Deploy notification
      run: |
        echo "🚀 Deployment triggered for Ermi Mobile"
        echo "📱 Changes will be live at: https://ermi-mobile.onrender.com"
        echo "⏱️ Deployment usually takes 2-3 minutes"
`;
    
    fs.writeFileSync(path.join(workflowDir, 'deploy.yml'), workflowContent);
    console.log('✅ Created GitHub Actions workflow');
}

function createAutoDeployScript() {
    console.log('\n📄 Creating auto-deploy script...');
    
    const autoDeployScript = `@echo off
echo 🔄 AUTO-DEPLOY TO RENDER
echo =======================

echo.
echo 📝 What changes did you make?
set /p changes="Enter description of changes: "

echo.
echo 📄 Adding all changes to Git...
git add .

echo.
echo 💾 Committing changes...
git commit -m "Auto-deploy: %changes%"

echo.
echo 🚀 Pushing to GitHub (this will trigger Render deployment)...
git push origin main

echo.
echo 🎉 AUTO-DEPLOYMENT TRIGGERED!
echo ============================
echo ✅ Changes committed and pushed to GitHub
echo ✅ Render will automatically deploy your changes
echo ✅ Your website will be updated in 2-3 minutes
echo.
echo 🌐 Your updated site will be live at:
echo    https://ermi-mobile.onrender.com
echo.
echo 📱 Changes made: %changes%
echo.
pause
`;
    
    fs.writeFileSync('auto-deploy.bat', autoDeployScript);
    console.log('✅ Created auto-deploy.bat');
}

function createQuickUpdateScript() {
    console.log('\n⚡ Creating quick update script...');
    
    const quickUpdateScript = `@echo off
echo ⚡ QUICK UPDATE TO RENDER
echo ========================

echo.
echo 🔄 Quick deploying your changes...
git add .
git commit -m "Quick update: %date% %time%"
git push origin main

echo.
echo 🎉 QUICK UPDATE DEPLOYED!
echo ========================
echo ✅ Changes pushed to GitHub
echo ✅ Render is automatically deploying
echo ✅ Your site will be updated in 2-3 minutes
echo.
echo 🌐 Check your updated site at:
echo    https://ermi-mobile.onrender.com
echo.
pause
`;
    
    fs.writeFileSync('quick-update.bat', quickUpdateScript);
    console.log('✅ Created quick-update.bat');
}

function createRenderConfig() {
    console.log('\n🔧 Updating Render configuration...');
    
    // Update render.yaml for auto-deploy
    const renderYaml = `services:
  - type: web
    name: ermi-mobile
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    autoDeploy: true
    branch: main
    envVars:
      - key: NODE_ENV
        value: production
    healthCheckPath: /health
`;
    
    fs.writeFileSync('render.yaml', renderYaml);
    console.log('✅ Updated render.yaml with auto-deploy enabled');
}

function createDeploymentGuide() {
    console.log('\n📋 Creating deployment guide...');
    
    const deploymentGuide = `# 🔄 AUTOMATIC DEPLOYMENT GUIDE

## ✅ AUTO-DEPLOYMENT IS NOW SET UP!

Every time you make changes and push to GitHub, Render will automatically deploy your updates!

## 🚀 HOW TO DEPLOY CHANGES

### Method 1: Auto-Deploy Script (Recommended)
\`\`\`bash
auto-deploy.bat
\`\`\`
- Asks you to describe your changes
- Commits and pushes to GitHub
- Triggers automatic Render deployment

### Method 2: Quick Update
\`\`\`bash
quick-update.bat
\`\`\`
- Instantly commits and pushes changes
- No description needed
- Fastest way to deploy

### Method 3: Manual Git Commands
\`\`\`bash
git add .
git commit -m "Your change description"
git push origin main
\`\`\`

## ⏱️ DEPLOYMENT TIMELINE

1. **You make changes** → Edit files locally
2. **Run auto-deploy.bat** → Commits and pushes to GitHub
3. **GitHub triggers Render** → Automatic deployment starts
4. **2-3 minutes later** → Your changes are live!

## 🌐 YOUR LIVE WEBSITE

**Main Store:** https://ermi-mobile.onrender.com
**Admin Panel:** https://ermi-mobile.onrender.com/admin.html

## 🔄 WHAT TRIGGERS AUTO-DEPLOYMENT

- ✅ Any push to the \`main\` branch
- ✅ Any changes to your code files
- ✅ Updates to server.js, index.html, script.js, etc.
- ✅ New products, settings, or admin changes

## 📱 EXAMPLE WORKFLOW

1. **Add a new product** in your admin panel locally
2. **Test it works** on localhost:3000
3. **Run auto-deploy.bat** 
4. **Wait 2-3 minutes**
5. **Check your live site** - new product is there!

## 🎯 BENEFITS OF AUTO-DEPLOYMENT

- ✅ **No manual deployment** - just push and it deploys
- ✅ **Always up-to-date** - your live site matches your local changes
- ✅ **Fast updates** - changes live in 2-3 minutes
- ✅ **Version control** - all changes tracked in Git
- ✅ **Rollback capability** - can revert if needed

## 🔧 RENDER DASHBOARD

You can monitor deployments at:
- Go to [render.com](https://render.com)
- Find your \`ermi-mobile\` service
- View deployment logs and status

## 🎉 YOU'RE ALL SET!

Your Ermi Mobile store now has automatic deployment! 
Just make changes and run \`auto-deploy.bat\` - your customers will see updates in minutes!

---
*Auto-deployment setup completed: January 2, 2025*`;
    
    fs.writeFileSync('AUTO_DEPLOYMENT_GUIDE.md', deploymentGuide);
    console.log('✅ Created AUTO_DEPLOYMENT_GUIDE.md');
}

function createInitialAutoDeployCommit() {
    console.log('\n📄 Creating initial auto-deploy commit script...');
    
    const initialCommitScript = `@echo off
echo 🎯 SETTING UP AUTO-DEPLOYMENT
echo =============================

echo.
echo 📄 Committing auto-deployment setup...
git add .
git commit -m "Setup automatic deployment to Render - auto-deploy enabled"

echo.
echo 🚀 Pushing auto-deployment setup...
git push origin main

echo.
echo 🎉 AUTO-DEPLOYMENT SETUP COMPLETE!
echo ==================================
echo ✅ GitHub Actions workflow created
echo ✅ Auto-deploy scripts created  
echo ✅ Render configuration updated
echo ✅ All changes pushed to GitHub
echo.
echo 🔄 FROM NOW ON:
echo - Make your changes locally
echo - Run: auto-deploy.bat
echo - Your changes will be live in 2-3 minutes!
echo.
echo 🌐 Your website: https://ermi-mobile.onrender.com
echo.
pause
`;
    
    fs.writeFileSync('setup-auto-deploy-commit.bat', initialCommitScript);
    console.log('✅ Created setup-auto-deploy-commit.bat');
}

// Execute all setup functions
createGitHubActions();
createAutoDeployScript();
createQuickUpdateScript();
createRenderConfig();
createDeploymentGuide();
createInitialAutoDeployCommit();

console.log('\n🎉 AUTOMATIC DEPLOYMENT SETUP COMPLETE!');
console.log('=======================================');
console.log('✅ GitHub Actions workflow created');
console.log('✅ Auto-deploy scripts created');
console.log('✅ Render configuration updated');
console.log('✅ Deployment guide created');
console.log('');
console.log('🚀 NEXT STEPS:');
console.log('1. Run: setup-auto-deploy-commit.bat');
console.log('2. From now on, use: auto-deploy.bat');
console.log('');
console.log('🔄 WORKFLOW:');
console.log('Make changes → Run auto-deploy.bat → Live in 2-3 minutes!');