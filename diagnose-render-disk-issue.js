const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('🔍 DIAGNOSING RENDER DISK ISSUE');
console.log('===============================');

// Environment check
console.log('📊 ENVIRONMENT:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   RENDER: ${process.env.RENDER || 'false'}`);
console.log(`   USE_PERSISTENT_STORAGE: ${process.env.USE_PERSISTENT_STORAGE || 'false'}`);
console.log(`   UPLOADS_PATH: ${process.env.UPLOADS_PATH || 'not set'}`);

// Path determination (same logic as server.js)
const isRender = process.env.RENDER === 'true';
const useRenderPersistentStorage = process.env.USE_PERSISTENT_STORAGE === 'true';

let uploadsDir;
if (isRender && useRenderPersistentStorage && process.env.UPLOADS_PATH) {
    uploadsDir = process.env.UPLOADS_PATH;
} else if (isRender && useRenderPersistentStorage) {
    uploadsDir = '/opt/render/project/src/uploads';
} else {
    uploadsDir = path.join(__dirname, 'uploads');
}

console.log(`\n📁 UPLOADS DIRECTORY: ${uploadsDir}`);

// Test 1: Check if uploads directory exists and is accessible
console.log('\n🧪 TEST 1: Directory Access');
console.log('===========================');

try {
    if (fs.existsSync(uploadsDir)) {
        console.log('✅ Uploads directory exists');
        
        const stats = fs.statSync(uploadsDir);
        console.log(`   Type: ${stats.isDirectory() ? 'Directory' : 'File'}`);
        console.log(`   Permissions: ${stats.mode.toString(8)}`);
        
        // Try to list files
        const files = fs.readdirSync(uploadsDir);
        console.log(`   Files count: ${files.length}`);
        
        if (files.length > 0) {
            console.log('   Sample files:');
            files.slice(0, 3).forEach(file => {
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
        } catch (createError) {
            console.log(`❌ Failed to create directory: ${createError.message}`);
        }
    }
} catch (error) {
    console.log(`❌ Directory access error: ${error.message}`);
}

// Test 2: Check database image paths
console.log('\n🧪 TEST 2: Database Image Paths');
console.log('===============================');

const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

console.log(`Database path: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    
    console.log('✅ Connected to database');
    
    // Get sample products with images
    db.all("SELECT id, name, image FROM products WHERE image IS NOT NULL LIMIT 5", [], (err, products) => {
        if (err) {
            console.error('❌ Database query error:', err.message);
            return;
        }
        
        console.log(`Found ${products.length} products with images:`);
        
        products.forEach(product => {
            console.log(`\n   Product: ${product.name} (ID: ${product.id})`);
            console.log(`   Image path in DB: ${product.image}`);
            
            // Check if image file exists
            let fullImagePath;
            if (product.image.startsWith('/uploads/')) {
                fullImagePath = path.join(__dirname, product.image);
            } else if (product.image.startsWith('uploads/')) {
                fullImagePath = path.join(__dirname, product.image);
            } else {
                console.log('   ⚠️  Unknown image path format');
                return;
            }
            
            if (fs.existsSync(fullImagePath)) {
                const stats = fs.statSync(fullImagePath);
                console.log(`   ✅ Image file exists (${stats.size} bytes)`);
            } else {
                console.log(`   ❌ Image file missing: ${fullImagePath}`);
            }
            
            // Check if image exists in render uploads directory
            const filename = path.basename(product.image);
            const renderImagePath = path.join(uploadsDir, filename);
            
            if (fs.existsSync(renderImagePath)) {
                const stats = fs.statSync(renderImagePath);
                console.log(`   ✅ Image exists in render uploads (${stats.size} bytes)`);
            } else {
                console.log(`   ❌ Image missing in render uploads: ${renderImagePath}`);
            }
        });
        
        // Test 3: Check server static file serving
        console.log('\n🧪 TEST 3: Static File Serving Configuration');
        console.log('============================================');
        
        console.log('Expected server configuration:');
        console.log(`   app.use('/uploads', express.static('${uploadsDir}'));`);
        console.log('');
        console.log('Image URL format should be:');
        console.log('   https://your-site.onrender.com/uploads/filename.jpg');
        
        // Test 4: Provide solutions
        console.log('\n💡 SOLUTIONS:');
        console.log('=============');
        
        if (!isRender) {
            console.log('🏠 RUNNING LOCALLY:');
            console.log('   - Images should work from local uploads folder');
            console.log('   - Deploy to Render to test persistent disk');
        } else if (!useRenderPersistentStorage) {
            console.log('⚠️  RENDER WITHOUT PERSISTENT STORAGE:');
            console.log('   - Set USE_PERSISTENT_STORAGE=true in environment');
            console.log('   - Ensure persistent disk is mounted');
        } else {
            console.log('🔧 RENDER WITH PERSISTENT STORAGE:');
            console.log('   - Check if persistent disk is properly mounted');
            console.log('   - Verify environment variables are set correctly');
            console.log('   - Copy images to persistent disk location');
        }
        
        db.close();
    });
});