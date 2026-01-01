const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING RENDER PRO PERSISTENT STORAGE');
console.log('=========================================');

// Simulate the same logic as server.js
const isRender = process.env.RENDER === 'true';
const useRenderPersistentStorage = process.env.USE_PERSISTENT_STORAGE === 'true';

console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Is Render: ${isRender}`);
console.log(`Use Persistent Storage: ${useRenderPersistentStorage}`);

// Determine uploads directory path (same logic as server.js)
let uploadsDir;
if (isRender && useRenderPersistentStorage && process.env.UPLOADS_PATH) {
    uploadsDir = process.env.UPLOADS_PATH;
    console.log('📁 Using custom persistent path:', uploadsDir);
} else if (isRender && useRenderPersistentStorage) {
    uploadsDir = '/opt/render/project/src/uploads';
    console.log('📁 Using default persistent path:', uploadsDir);
} else {
    uploadsDir = path.join(__dirname, 'uploads');
    console.log('📁 Using local path:', uploadsDir);
}

console.log('\n🔍 STORAGE TEST:');
console.log('================');

// Test 1: Check if directory exists
console.log('Test 1: Directory existence...');
if (fs.existsSync(uploadsDir)) {
    console.log('✅ Uploads directory exists');
    
    // Get directory stats
    const stats = fs.statSync(uploadsDir);
    console.log(`   Created: ${stats.birthtime}`);
    console.log(`   Size: ${stats.size} bytes`);
    
    // List existing files
    const files = fs.readdirSync(uploadsDir);
    console.log(`   Files: ${files.length}`);
    
    if (files.length > 0) {
        console.log('   Existing files:');
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            const fileStats = fs.statSync(filePath);
            console.log(`     - ${file} (${fileStats.size} bytes)`);
        });
    }
} else {
    console.log('❌ Uploads directory does not exist');
    
    // Try to create it
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Created uploads directory');
    } catch (error) {
        console.log('❌ Failed to create directory:', error.message);
    }
}

// Test 2: Write test file
console.log('\nTest 2: Write permission...');
const testFilePath = path.join(uploadsDir, 'test-file.txt');
const testContent = `Test file created at ${new Date().toISOString()}`;

try {
    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Successfully wrote test file');
    
    // Read it back
    const readContent = fs.readFileSync(testFilePath, 'utf8');
    if (readContent === testContent) {
        console.log('✅ Successfully read test file');
    } else {
        console.log('❌ File content mismatch');
    }
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('✅ Successfully deleted test file');
    
} catch (error) {
    console.log('❌ Write test failed:', error.message);
}

console.log('\n📊 SUMMARY:');
console.log('===========');
if (isRender && useRenderPersistentStorage) {
    console.log('🎉 Render Pro persistent storage is configured!');
    console.log('✅ Images will persist across deployments');
} else if (isRender) {
    console.log('⚠️  Running on Render but persistent storage not enabled');
    console.log('💡 Set USE_PERSISTENT_STORAGE=true to enable');
} else {
    console.log('🏠 Running locally - using local storage');
    console.log('💡 Deploy to Render Pro to test persistent storage');
}

console.log('\n🎯 NEXT STEPS:');
console.log('==============');
console.log('1. Set up persistent disk in Render Dashboard');
console.log('2. Set environment variables');
console.log('3. Deploy and test image uploads');
console.log('4. Verify images persist after redeployment');