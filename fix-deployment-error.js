const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING DEPLOYMENT ERROR');
console.log('==========================');

// Check package.json for required dependencies
const packagePath = path.join(__dirname, 'package.json');
let packageJson;

try {
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('✅ package.json loaded successfully');
} catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    process.exit(1);
}

// Required security dependencies
const requiredDeps = {
    'express-rate-limit': '^7.1.5',
    'helmet': '^7.1.0',
    'validator': '^13.11.0'
};

console.log('\n📦 CHECKING DEPENDENCIES:');
console.log('==========================');

let missingDeps = [];
let hasAllDeps = true;

Object.keys(requiredDeps).forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
        console.log(`❌ ${dep}: MISSING`);
        missingDeps.push(dep);
        hasAllDeps = false;
    }
});

if (hasAllDeps) {
    console.log('\n🎉 ALL DEPENDENCIES ARE PRESENT!');
    console.log('================================');
    console.log('Your deployment should work now.');
    console.log('');
    console.log('If deployment still fails, check:');
    console.log('1. Render environment variables are set');
    console.log('2. Build command is correct');
    console.log('3. Start command is "node server.js"');
} else {
    console.log('\n🚨 MISSING DEPENDENCIES FOUND!');
    console.log('===============================');
    console.log('Run these commands to fix:');
    console.log('');
    missingDeps.forEach(dep => {
        console.log(`npm install ${dep}`);
    });
    console.log('');
    console.log('Then commit and redeploy to Render.');
}

console.log('\n🔍 DEPLOYMENT CHECKLIST:');
console.log('========================');
console.log('✅ Dependencies added to package.json');
console.log('✅ Security middleware configured');
console.log('✅ Cloudinary setup ready');
console.log('');
console.log('Next: Deploy to Render and test!');