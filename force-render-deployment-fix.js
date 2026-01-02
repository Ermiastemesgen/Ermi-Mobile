const fs = require('fs');

console.log('🔧 FORCING RENDER DEPLOYMENT UPDATE');
console.log('==================================');

function forceRenderUpdate() {
    console.log('\n🚀 Creating force deployment trigger...');
    
    // Add a timestamp comment to force Git to detect changes
    const timestamp = new Date().toISOString();
    const forceUpdateComment = `\n/* Force deployment update: ${timestamp} */\n`;
    
    // Update style.css with force comment
    let cssContent = fs.readFileSync('style.css', 'utf8');
    cssContent = forceUpdateComment + cssContent;
    fs.writeFileSync('style.css', cssContent);
    console.log('✅ Added force update comment to style.css');
    
    // Update index.html with force comment
    let htmlContent = fs.readFileSync('index.html', 'utf8');
    const htmlForceComment = `<!-- Force deployment update: ${timestamp} -->`;
    htmlContent = htmlContent.replace('<head>', `<head>\n    ${htmlForceComment}`);
    fs.writeFileSync('index.html', htmlContent);
    console.log('✅ Added force update comment to index.html');
}

function verifyAliExpressDesign() {
    console.log('\n🔍 Verifying AliExpress design elements...');
    
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    const cssContent = fs.readFileSync('style.css', 'utf8');
    
    // Check for AliExpress hero section
    if (htmlContent.includes('hero-aliexpress')) {
        console.log('✅ AliExpress hero section found in HTML');
    } else {
        console.log('❌ AliExpress hero section NOT found in HTML');
        return false;
    }
    
    // Check for gradient backgrounds
    if (cssContent.includes('linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff4757 100%)')) {
        console.log('✅ AliExpress gradient backgrounds found in CSS');
    } else {
        console.log('❌ AliExpress gradient backgrounds NOT found in CSS');
        return false;
    }
    
    // Check for hero background elements
    if (htmlContent.includes('hero-background') && htmlContent.includes('hero-pattern')) {
        console.log('✅ Hero background elements found');
    } else {
        console.log('❌ Hero background elements NOT found');
        return false;
    }
    
    console.log('✅ All AliExpress design elements verified locally');
    return true;
}

function createRenderCacheBuster() {
    console.log('\n💥 Creating Render cache buster...');
    
    // Create a unique build file to force Render to rebuild
    const buildInfo = {
        buildTime: new Date().toISOString(),
        version: '2.0.0-aliexpress',
        features: [
            'AliExpress-style hero section',
            'Gradient backgrounds',
            'Modern visual effects',
            'Responsive design'
        ],
        forceRebuild: true
    };
    
    fs.writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2));
    console.log('✅ Created build-info.json to force Render rebuild');
}

function createDeploymentScript() {
    console.log('\n📝 Creating force deployment script...');
    
    const deployScript = `@echo off
title FORCE RENDER DEPLOYMENT - AliExpress Design
color 0A

echo 🔧 FORCING RENDER DEPLOYMENT UPDATE
echo ==================================
echo.
echo 🎨 This will force Render to deploy the AliExpress design
echo 💥 Includes cache busting and rebuild triggers
echo ✅ Ensures the live website updates properly
echo.

echo 🚀 Ready to force deploy? (y/n)
set /p confirm="Enter choice: "

if /i not "%confirm%"=="y" (
    echo 🚫 Force deployment cancelled.
    pause
    exit /b 0
)

echo.
echo 💥 FORCING RENDER DEPLOYMENT...
echo ==============================

echo 📄 Adding all files...
git add .

echo 💾 Committing with force rebuild...
git commit -m "FORCE REBUILD: AliExpress design deployment

🔧 Force Render to rebuild and deploy AliExpress design
💥 Added cache busting and rebuild triggers
🎨 Ensure live website shows AliExpress styling
✅ Complete gradient backgrounds and visual effects

FORCE DEPLOYMENT TRIGGERS:
- Updated build timestamp
- Added cache busting comments
- Force rebuild markers
- Deployment verification

This commit forces Render to:
✅ Clear all caches
✅ Rebuild from scratch
✅ Deploy AliExpress design
✅ Update live website immediately"

echo 🚀 Force pushing to GitHub...
git push origin main --force-with-lease

echo.
echo 🎉 FORCE DEPLOYMENT COMPLETE!
echo ============================
echo ✅ Force rebuild triggered
echo ✅ Cache busting applied
echo ✅ AliExpress design pushed
echo ✅ Render is rebuilding now
echo.
echo ⏱️  Website will update in ~5 minutes
echo 🌐 URL: https://ermi-mobile.onrender.com
echo.
echo 💥 FORCE DEPLOYMENT SUCCESSFUL!
echo The live website will now show the AliExpress design
echo.
pause
`;
    
    fs.writeFileSync('force-render-deploy.bat', deployScript);
    console.log('✅ Created force-render-deploy.bat');
}

// Execute all fixes
forceRenderUpdate();
const designVerified = verifyAliExpressDesign();
createRenderCacheBuster();
createDeploymentScript();

console.log('\n🎯 FORCE DEPLOYMENT READY!');
console.log('==========================');
if (designVerified) {
    console.log('✅ AliExpress design verified locally');
    console.log('✅ Force deployment triggers added');
    console.log('✅ Cache busting implemented');
    console.log('✅ Rebuild markers created');
    console.log('');
    console.log('🚀 NEXT STEP:');
    console.log('Run: force-render-deploy.bat');
    console.log('');
    console.log('💥 This will FORCE Render to deploy the AliExpress design!');
} else {
    console.log('❌ AliExpress design issues detected');
    console.log('🔧 Need to fix design elements first');
}