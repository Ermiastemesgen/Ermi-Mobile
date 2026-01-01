const fs = require('fs');
const path = require('path');

console.log('⚙️  RENDER PRO CONFIGURATION HELPER');
console.log('===================================');

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found .env file');
} catch (error) {
    console.log('❌ .env file not found, creating new one...');
    envContent = '';
}

// Check if persistent storage variables exist
const hasPersistentStorage = envContent.includes('USE_PERSISTENT_STORAGE');
const hasUploadsPath = envContent.includes('UPLOADS_PATH');

console.log('\n📊 CURRENT CONFIGURATION:');
console.log('==========================');
console.log(`Persistent Storage Setting: ${hasPersistentStorage ? '✅ Configured' : '❌ Missing'}`);
console.log(`Uploads Path Setting: ${hasUploadsPath ? '✅ Configured' : '❌ Missing'}`);

// Add persistent storage configuration if missing
if (!hasPersistentStorage || !hasUploadsPath) {
    console.log('\n🔧 ADDING RENDER PRO CONFIGURATION...');
    
    let newEnvContent = envContent;
    
    if (!hasPersistentStorage) {
        newEnvContent += '\n# Render Pro Persistent Storage\n';
        newEnvContent += 'USE_PERSISTENT_STORAGE=true\n';
    }
    
    if (!hasUploadsPath) {
        newEnvContent += 'UPLOADS_PATH=/opt/render/project/src/uploads\n';
    }
    
    // Write updated .env file
    try {
        fs.writeFileSync(envPath, newEnvContent);
        console.log('✅ Updated .env file with Render Pro configuration');
    } catch (error) {
        console.error('❌ Failed to update .env file:', error.message);
    }
} else {
    console.log('\n✅ .env file already configured for Render Pro');
}

console.log('\n📋 RENDER DASHBOARD SETUP CHECKLIST:');
console.log('====================================');
console.log('□ 1. Go to Render Dashboard');
console.log('□ 2. Select your web service');
console.log('□ 3. Go to Settings tab');
console.log('□ 4. Scroll to "Persistent Disks"');
console.log('□ 5. Click "Add Disk"');
console.log('□ 6. Configure disk:');
console.log('     - Name: uploads-storage');
console.log('     - Mount Path: /opt/render/project/src/uploads');
console.log('     - Size: 1GB (minimum)');
console.log('□ 7. Click "Create Disk"');
console.log('□ 8. Set environment variables:');
console.log('     - USE_PERSISTENT_STORAGE=true');
console.log('     - UPLOADS_PATH=/opt/render/project/src/uploads');
console.log('□ 9. Deploy your service');

console.log('\n🎯 BENEFITS OF RENDER PRO PERSISTENT STORAGE:');
console.log('=============================================');
console.log('✅ Images persist across deployments');
console.log('✅ No external dependencies (like Cloudinary)');
console.log('✅ Fast local file access');
console.log('✅ No additional costs for image storage');
console.log('✅ Simple backup and management');

console.log('\n💡 NEXT STEPS:');
console.log('==============');
console.log('1. Complete the Render Dashboard setup above');
console.log('2. Commit and push your changes');
console.log('3. Deploy to Render');
console.log('4. Test image uploads through admin panel');
console.log('5. Images will now persist permanently!');