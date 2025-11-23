#!/usr/bin/env node

/**
 * Railway Migration Helper Script
 * Automates the migration from Render to Railway
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Railway Migration Helper');
console.log('==========================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run this script from your project root.');
    process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`📦 Project: ${packageJson.name || 'Unknown'}`);
console.log(`📝 Description: ${packageJson.description || 'No description'}\n`);

// Check for required files
const requiredFiles = ['server.js', '.env'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.log('⚠️  Missing files:', missingFiles.join(', '));
    console.log('   These files are recommended for Railway deployment.\n');
}

// Read .env file if it exists
let envVars = {};
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim();
        }
    });
    console.log('✅ Found .env file with', Object.keys(envVars).length, 'variables');
} else {
    console.log('⚠️  No .env file found');
}

// Create Railway configuration
const railwayConfig = {
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
        "builder": "NIXPACKS"
    },
    "deploy": {
        "startCommand": "npm start",
        "healthcheckPath": "/",
        "healthcheckTimeout": 100,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
    }
};

// Write railway.json
fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
console.log('✅ Created railway.json configuration file');

// Create environment variables template
const envTemplate = `# Railway Environment Variables
# Copy these to your Railway dashboard under Variables tab

# Required
NODE_ENV=production
PORT=3000

# Cloudinary (for image storage)
${envVars.CLOUDINARY_CLOUD_NAME ? `CLOUDINARY_CLOUD_NAME=${envVars.CLOUDINARY_CLOUD_NAME}` : 'CLOUDINARY_CLOUD_NAME=your_cloud_name'}
${envVars.CLOUDINARY_API_KEY ? `CLOUDINARY_API_KEY=${envVars.CLOUDINARY_API_KEY}` : 'CLOUDINARY_API_KEY=your_api_key'}
${envVars.CLOUDINARY_API_SECRET ? `CLOUDINARY_API_SECRET=${envVars.CLOUDINARY_API_SECRET}` : 'CLOUDINARY_API_SECRET=your_api_secret'}

# Email (for notifications)
${envVars.EMAIL_USER ? `EMAIL_USER=${envVars.EMAIL_USER}` : 'EMAIL_USER=your_email@gmail.com'}
${envVars.EMAIL_PASS ? `EMAIL_PASS=${envVars.EMAIL_PASS}` : 'EMAIL_PASS=your_app_password'}

# Admin credentials
${envVars.ADMIN_EMAIL ? `ADMIN_EMAIL=${envVars.ADMIN_EMAIL}` : 'ADMIN_EMAIL=ermias616@gmail.com'}
${envVars.ADMIN_PASSWORD ? `ADMIN_PASSWORD=${envVars.ADMIN_PASSWORD}` : 'ADMIN_PASSWORD=your_admin_password'}

# Website URL (Railway will provide this)
WEBSITE_URL=https://your-project.railway.app
`;

fs.writeFileSync('railway-env-template.txt', envTemplate);
console.log('✅ Created railway-env-template.txt with your environment variables');

// Create migration checklist
const checklist = `# Railway Migration Checklist

## ✅ Pre-Migration (Done by script)
- [x] Created railway.json configuration
- [x] Generated environment variables template
- [x] Verified project structure

## 📋 Manual Steps Required

### 1. Backup Current Data
- [ ] Export products from Render admin panel
- [ ] Save any important data
- [ ] Note down current Render URL

### 2. Deploy to Railway
- [ ] Go to https://railway.app
- [ ] Sign up/login with GitHub
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select this repository: ${packageJson.name || 'your-repo'}
- [ ] Wait for initial deployment

### 3. Configure Environment Variables
- [ ] Go to Railway dashboard → Variables tab
- [ ] Copy variables from railway-env-template.txt
- [ ] Update with your actual values
- [ ] Save all variables

### 4. Test Deployment
- [ ] Visit your Railway URL
- [ ] Test admin login: ${envVars.ADMIN_EMAIL || 'ermias616@gmail.com'}
- [ ] Verify all pages load correctly
- [ ] Test product creation/editing

### 5. Migrate Data
- [ ] Add your products via Railway admin panel
- [ ] Upload product images
- [ ] Test hero slider functionality
- [ ] Verify user registration/login

### 6. Update DNS (if using custom domain)
- [ ] Update domain DNS to point to Railway
- [ ] Configure custom domain in Railway dashboard
- [ ] Wait for SSL certificate

### 7. Final Steps
- [ ] Update bookmarks to new Railway URL
- [ ] Inform users of new URL (if needed)
- [ ] Monitor Railway deployment logs
- [ ] Delete Render service (optional)

## 🎯 Railway URLs (after deployment)
- Main site: https://your-project.railway.app
- Admin panel: https://your-project.railway.app/admin-simple.html
- Profile page: https://your-project.railway.app/profile.html

## 🆘 Need Help?
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions
`;

fs.writeFileSync('RAILWAY_MIGRATION_CHECKLIST.md', checklist);
console.log('✅ Created RAILWAY_MIGRATION_CHECKLIST.md');

// Check package.json scripts
if (!packageJson.scripts || !packageJson.scripts.start) {
    console.log('\n⚠️  Warning: No "start" script found in package.json');
    console.log('   Railway needs a start script. Adding one...');
    
    if (!packageJson.scripts) packageJson.scripts = {};
    packageJson.scripts.start = 'node server.js';
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Added "start": "node server.js" to package.json');
}

// Summary
console.log('\n🎉 Migration Preparation Complete!');
console.log('=====================================');
console.log('✅ railway.json - Railway configuration');
console.log('✅ railway-env-template.txt - Environment variables');
console.log('✅ RAILWAY_MIGRATION_CHECKLIST.md - Step-by-step checklist');
console.log('✅ package.json - Updated with start script');

console.log('\n🚀 Next Steps:');
console.log('1. Commit these changes to GitHub');
console.log('2. Go to https://railway.app');
console.log('3. Deploy from GitHub repo');
console.log('4. Follow RAILWAY_MIGRATION_CHECKLIST.md');

console.log('\n📋 Quick Deploy:');
console.log('git add .');
console.log('git commit -m "Prepare for Railway migration"');
console.log('git push origin main');

console.log('\n🌐 Then visit: https://railway.app');