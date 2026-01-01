const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🚀 AUTOMATIC MIGRATION TO RENDER PERSISTENT DISK');
console.log('================================================');

// Database path
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

// Storage paths
const localUploadsPath = path.join(__dirname, 'uploads');
const isRender = process.env.RENDER === 'true';
const useRenderPersistentStorage = process.env.USE_PERSISTENT_STORAGE === 'true';

let renderUploadsPath;
if (isRender && useRenderPersistentStorage && process.env.UPLOADS_PATH) {
    renderUploadsPath = process.env.UPLOADS_PATH;
} else if (isRender && useRenderPersistentStorage) {
    renderUploadsPath = '/opt/render/project/src/uploads';
} else {
    renderUploadsPath = localUploadsPath; // Fallback for local testing
}

console.log(`Local uploads: ${localUploadsPath}`);
console.log(`Render persistent disk: ${renderUploadsPath}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Is Render: ${isRender}`);
console.log(`Use persistent storage: ${useRenderPersistentStorage}`);

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to database');
});

// Migration function
async function migrateImages() {
    console.log('\n🔄 STARTING IMAGE MIGRATION');
    console.log('============================');

    // Ensure render uploads directory exists
    if (!fs.existsSync(renderUploadsPath)) {
        try {
            fs.mkdirSync(renderUploadsPath, { recursive: true });
            console.log('✅ Created render uploads directory');
        } catch (error) {
            console.error('❌ Failed to create render uploads directory:', error.message);
            return;
        }
    }

    // Get all products with images
    db.all(`
        SELECT p.id, p.name, p.image, pi.image_url 
        FROM products p 
        LEFT JOIN product_images pi ON p.id = pi.product_id
    `, [], async (err, rows) => {
        if (err) {
            console.error('❌ Error fetching products:', err.message);
            return;
        }

        console.log(`\n📊 Found ${rows.length} product image records`);
        
        let migratedCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // Process each image
        for (const row of rows) {
            const images = [];
            
            // Collect all image paths
            if (row.image && row.image.startsWith('/uploads/')) {
                images.push({ type: 'main', path: row.image, productId: row.id });
            }
            if (row.image_url && row.image_url.startsWith('/uploads/')) {
                images.push({ type: 'additional', path: row.image_url, productId: row.id });
            }

            // Migrate each image
            for (const imageInfo of images) {
                const localImagePath = path.join(__dirname, imageInfo.path);
                const filename = path.basename(imageInfo.path);
                const renderImagePath = path.join(renderUploadsPath, filename);

                console.log(`\n🔄 Processing: ${imageInfo.path}`);
                console.log(`   Product: ${row.name} (ID: ${row.id})`);

                // Check if local image exists
                if (!fs.existsSync(localImagePath)) {
                    console.log(`   ⚠️  Local image not found, skipping`);
                    skippedCount++;
                    continue;
                }

                // Check if already exists in render disk
                if (fs.existsSync(renderImagePath)) {
                    console.log(`   ✅ Already exists on render disk`);
                    skippedCount++;
                    continue;
                }

                // Copy image to render disk
                try {
                    fs.copyFileSync(localImagePath, renderImagePath);
                    console.log(`   ✅ Copied to render disk`);
                    migratedCount++;
                } catch (error) {
                    console.log(`   ❌ Copy failed: ${error.message}`);
                    errorCount++;
                }
            }
        }

        console.log('\n📈 MIGRATION SUMMARY');
        console.log('====================');
        console.log(`✅ Images migrated: ${migratedCount}`);
        console.log(`⚠️  Images skipped: ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);

        if (migratedCount > 0) {
            console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
            console.log('====================================');
            console.log('Your product images are now on the Render persistent disk.');
            console.log('They will persist across all deployments.');
        } else if (skippedCount > 0) {
            console.log('\n✅ ALL IMAGES ALREADY MIGRATED!');
            console.log('===============================');
            console.log('Your images are already on the persistent disk.');
        } else {
            console.log('\n⚠️  NO IMAGES TO MIGRATE');
            console.log('========================');
            console.log('No local images found to migrate.');
        }

        // List files in render uploads directory
        try {
            const renderFiles = fs.readdirSync(renderUploadsPath);
            console.log(`\n📁 Files on render persistent disk: ${renderFiles.length}`);
            if (renderFiles.length > 0) {
                console.log('   Recent files:');
                renderFiles.slice(-5).forEach(file => {
                    const filePath = path.join(renderUploadsPath, file);
                    const stats = fs.statSync(filePath);
                    console.log(`     - ${file} (${stats.size} bytes)`);
                });
            }
        } catch (error) {
            console.log(`❌ Error listing render disk files: ${error.message}`);
        }

        db.close();
    });
}

// Start migration
migrateImages();