const fs = require('fs');
const path = require('path');

console.log('🚀 RENDER PRO - PERSISTENT STORAGE SETUP');
console.log('========================================');

// Check if we're in production (Render environment)
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true';

console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Is Render: ${isRender ? 'Yes' : 'No'}`);

// Define storage paths
const localUploadsPath = path.join(__dirname, 'uploads');
const renderPersistentPath = '/opt/render/project/src/uploads';
const customUploadsPath = process.env.UPLOADS_PATH;

console.log('\n📁 STORAGE PATHS:');
console.log('==================');
console.log(`Local uploads: ${localUploadsPath}`);
console.log(`Render persistent: ${renderPersistentPath}`);
console.log(`Custom path: ${customUploadsPath || 'Not set'}`);

// Determine which path to use
let uploadsPath;
if (isRender && customUploadsPath) {
    uploadsPath = customUploadsPath;
    console.log(`✅ Using custom persistent path: ${uploadsPath}`);
} else if (isRender) {
    uploadsPath = renderPersistentPath;
    console.log(`✅ Using default Render persistent path: ${uploadsPath}`);
} else {
    uploadsPath = localUploadsPath;
    console.log(`✅ Using local development path: ${uploadsPath}`);
}

// Check if uploads directory exists
console.log('\n🔍 DIRECTORY STATUS:');
console.log('====================');

try {
    if (fs.existsSync(uploadsPath)) {
        const stats = fs.statSync(uploadsPath);
        console.log(`✅ Uploads directory exists: ${uploadsPath}`);
        console.log(`   Created: ${stats.birthtime}`);
        console.log(`   Modified: ${stats.mtime}`);
        
        // List files in uploads directory
        const files = fs.readdirSync(uploadsPath);
        console.log(`   Files: ${files.length}`);
        if (files.length > 0) {
            console.log('   Contents:');
            files.slice(0, 5).forEach(file => {
                console.log(`     - ${file}`);
            });
            if (files.length > 5) {
                console.log(`     ... and ${files.length - 5} more files`);
            }
        }
    } else {
        console.log(`❌ Uploads directory does not exist: ${uploadsPath}`);
        
        // Try to create it
        try {
            fs.mkdirSync(uploadsPath, { recursive: true });
            console.log(`✅ Created uploads directory: ${uploadsPath}`);
        } catch (createError) {
            console.log(`❌ Failed to create directory: ${createError.message}`);
        }
    }
} catch (error) {
    console.log(`❌ Error checking directory: ${error.message}`);
}

console.log('\n💡 RENDER PRO SETUP INSTRUCTIONS:');
console.log('==================================');
console.log('1. Go to Render Dashboard → Your Service → Settings');
console.log('2. Scroll to "Persistent Disks"');
console.log('3. Click "Add Disk"');
console.log('4. Configure:');
console.log('   - Name: uploads-storage');
console.log('   - Mount Path: /opt/render/project/src/uploads');
console.log('   - Size: 1GB (or more)');
console.log('5. Deploy your service');
console.log('6. Images will now persist across deployments!');

console.log('\n🎯 EXPECTED RESULT:');
console.log('===================');
console.log('✅ Images uploaded through admin panel will be saved to persistent disk');
console.log('✅ Images will survive deployments and restarts');
console.log('✅ No more disappearing images!');