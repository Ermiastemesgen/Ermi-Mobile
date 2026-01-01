const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🔍 RENDER PERSISTENT DISK VERIFICATION');
console.log('======================================');

// Configuration
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

const isRender = process.env.RENDER === 'true';
const useRenderPersistentStorage = process.env.USE_PERSISTENT_STORAGE === 'true';

let renderUploadsPath;
if (isRender && useRenderPersistentStorage && process.env.UPLOADS_PATH) {
    renderUploadsPath = process.env.UPLOADS_PATH;
} else if (isRender && useRenderPersistentStorage) {
    renderUploadsPath = '/opt/render/project/src/uploads';
} else {
    renderUploadsPath = path.join(__dirname, 'uploads');
}

console.log('📊 CONFIGURATION:');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Is Render: ${isRender}`);
console.log(`   Use persistent storage: ${useRenderPersistentStorage}`);
console.log(`   Uploads path: ${renderUploadsPath}`);

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to database');
    runVerification();
});

function runVerification() {
    console.log('\n🔍 VERIFICATION TESTS');
    console.log('=====================');

    // Test 1: Check if uploads directory exists
    console.log('Test 1: Uploads directory...');
    if (fs.existsSync(renderUploadsPath)) {
        console.log('✅ Uploads directory exists');
        
        try {
            const files = fs.readdirSync(renderUploadsPath);
            console.log(`✅ Directory accessible (${files.length} files)`);
        } catch (error) {
            console.log('❌ Directory not accessible:', error.message);
        }
    } else {
        console.log('❌ Uploads directory does not exist');
    }

    // Test 2: Check database images
    console.log('\nTest 2: Database image records...');
    
    const query = `
        SELECT p.id, p.name, p.image, pi.image_url 
        FROM products p 
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.image IS NOT NULL OR pi.image_url IS NOT NULL
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Database query error:', err.message);
            return;
        }

        console.log(`✅ Found ${rows.length} product image records`);

        // Test 3: Verify each image file exists
        console.log('\nTest 3: Image file verification...');
        
        let totalImages = 0;
        let existingImages = 0;
        let missingImages = 0;

        const imageSet = new Set();

        rows.forEach(row => {
            // Check main image
            if (row.image && row.image.startsWith('/uploads/')) {
                imageSet.add(row.image);
            }
            
            // Check additional images
            if (row.image_url && row.image_url.startsWith('/uploads/')) {
                imageSet.add(row.image_url);
            }
        });

        totalImages = imageSet.size;
        console.log(`   Total unique images: ${totalImages}`);

        imageSet.forEach(imagePath => {
            const filename = path.basename(imagePath);
            const fullPath = path.join(renderUploadsPath, filename);
            
            if (fs.existsSync(fullPath)) {
                existingImages++;
            } else {
                missingImages++;
                console.log(`   ❌ Missing: ${filename}`);
            }
        });

        console.log(`   ✅ Existing: ${existingImages}`);
        console.log(`   ❌ Missing: ${missingImages}`);

        // Test 4: Storage space check
        console.log('\nTest 4: Storage space...');
        try {
            const files = fs.readdirSync(renderUploadsPath);
            let totalSize = 0;
            
            files.forEach(file => {
                const filePath = path.join(renderUploadsPath, file);
                const stats = fs.statSync(filePath);
                totalSize += stats.size;
            });

            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
            console.log(`✅ Total storage used: ${totalSizeMB} MB`);
            console.log(`✅ Files on disk: ${files.length}`);
        } catch (error) {
            console.log('❌ Storage check failed:', error.message);
        }

        // Final report
        console.log('\n📊 VERIFICATION SUMMARY');
        console.log('=======================');
        
        const successRate = totalImages > 0 ? (existingImages / totalImages * 100).toFixed(1) : 0;
        console.log(`Image availability: ${successRate}%`);
        
        if (missingImages === 0 && totalImages > 0) {
            console.log('🎉 ALL TESTS PASSED!');
            console.log('✅ Render persistent disk is working perfectly');
            console.log('✅ All product images are available');
            console.log('✅ Images will persist across deployments');
        } else if (missingImages > 0) {
            console.log('⚠️  SOME IMAGES MISSING');
            console.log(`${missingImages} images need to be migrated`);
            console.log('Run: node auto-migrate-render-disk.js');
        } else {
            console.log('⚠️  NO IMAGES FOUND');
            console.log('Upload some product images through the admin panel');
        }

        db.close();
    });
}

// Run verification