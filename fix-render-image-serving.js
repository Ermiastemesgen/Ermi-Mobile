const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING RENDER IMAGE SERVING ISSUE');
console.log('====================================');

// Check current server.js configuration
const serverPath = path.join(__dirname, 'server.js');

try {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    console.log('📊 ANALYZING SERVER.JS CONFIGURATION:');
    console.log('=====================================');
    
    // Check for uploads static serving
    const hasUploadsStatic = serverContent.includes("app.use('/uploads'");
    console.log(`Static uploads serving: ${hasUploadsStatic ? '✅ Found' : '❌ Missing'}`);
    
    // Check for uploads directory configuration
    const hasUploadsDir = serverContent.includes('uploadsDir');
    console.log(`Uploads directory config: ${hasUploadsDir ? '✅ Found' : '❌ Missing'}`);
    
    // Check for persistent storage logic
    const hasPersistentLogic = serverContent.includes('USE_PERSISTENT_STORAGE');
    console.log(`Persistent storage logic: ${hasPersistentLogic ? '✅ Found' : '❌ Missing'}`);
    
    console.log('\n🔍 COMMON ISSUES ON RENDER:');
    console.log('===========================');
    console.log('1. Persistent disk not properly mounted');
    console.log('2. Environment variables not set');
    console.log('3. Images not copied to persistent disk');
    console.log('4. Static file serving path incorrect');
    
    console.log('\n💡 SOLUTIONS:');
    console.log('=============');
    
    console.log('\n🔧 OPTION 1: Use Cloudinary (Recommended)');
    console.log('------------------------------------------');
    console.log('Since persistent disk is having issues, use Cloudinary:');
    console.log('1. Set up Cloudinary account (free)');
    console.log('2. Add credentials to Render environment variables');
    console.log('3. Re-upload images through admin panel');
    console.log('4. Images will be stored in cloud permanently');
    
    console.log('\n🔧 OPTION 2: Fix Persistent Disk');
    console.log('--------------------------------');
    console.log('1. Verify persistent disk is mounted in Render dashboard');
    console.log('2. Check environment variables are set correctly');
    console.log('3. Run image migration script on deployed server');
    
    console.log('\n🔧 OPTION 3: Temporary Fix - Re-upload Images');
    console.log('---------------------------------------------');
    console.log('1. Go to your deployed admin panel');
    console.log('2. Edit each product with missing images');
    console.log('3. Re-upload the images');
    console.log('4. Images will be stored correctly');
    
} catch (error) {
    console.error('❌ Error reading server.js:', error.message);
}

console.log('\n🚀 IMMEDIATE ACTION PLAN:');
console.log('=========================');
console.log('1. Check Render logs for specific errors');
console.log('2. Verify persistent disk is mounted');
console.log('3. Set up Cloudinary as backup solution');
console.log('4. Re-upload images through admin panel');

// Create a simple test endpoint for image serving
console.log('\n📝 CREATING TEST ENDPOINT:');
console.log('==========================');

const testEndpoint = `
// Add this to your server.js for testing
app.get('/test-images', (req, res) => {
    const uploadsPath = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
    
    try {
        const files = fs.readdirSync(uploadsPath);
        res.json({
            uploadsPath: uploadsPath,
            filesCount: files.length,
            files: files.slice(0, 5),
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                RENDER: process.env.RENDER,
                USE_PERSISTENT_STORAGE: process.env.USE_PERSISTENT_STORAGE,
                UPLOADS_PATH: process.env.UPLOADS_PATH
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            uploadsPath: uploadsPath
        });
    }
});
`;

try {
    fs.writeFileSync('test-endpoint.js', testEndpoint);
    console.log('✅ Created test-endpoint.js');
    console.log('   Add this code to server.js to debug image serving');
} catch (error) {
    console.log('❌ Failed to create test endpoint file');
}

console.log('\n🎯 NEXT STEPS:');
console.log('==============');
console.log('1. Visit your deployed site /test-images endpoint');
console.log('2. Check what files are available on the server');
console.log('3. Based on results, choose the best solution');
console.log('4. Implement the fix and redeploy');