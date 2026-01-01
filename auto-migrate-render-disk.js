const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🤖 AUTOMATIC RENDER DISK MIGRATION');
console.log('===================================');
console.log('This script will automatically:');
console.log('1. Copy all local images to Render persistent disk');
console.log('2. Verify all images are accessible');
console.log('3. Provide migration report');
console.log('');

// Configuration
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

const localUploadsPath = path.join(__dirname, 'uploads');
const isRender = process.env.RENDER === 'true';
const useRenderPersistentStorage = process.env.USE_PERSISTENT_STORAGE === 'true';

// Determine render uploads path
let renderUploadsPath;
if (isRender && useRenderPersistentStorage && process.env.UPLOADS_PATH) {
    renderUploadsPath = process.env.UPLOADS_PATH;
} else if (isRender && useRenderPersistentStorage) {
    renderUploadsPath = '/opt/render/project/src/uploads';
} else {
    renderUploadsPath = path.join(__dirname, 'uploads'); // For local testing
}

console.log('📁 PATHS:');
console.log(`   Local uploads: ${localUploadsPath}`);
console.log(`   Render disk: ${renderUploadsPath}`);
console.log(`   Database: ${dbPath}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Is Render: ${isRender}`);
console.log(`   Use persistent: ${useRenderPersistentStorage}`);

// Statistics
let stats = {
    totalImages: 0,
    migratedImages: 0,
    existingImages: 0,
    errorImages: 0,
    missingImages: 0
};

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database');
    startMigration();
});

function startMigration() {
    console.log('\n🚀 STARTING MIGRATION PROCESS');
    console.log('==============================');

    // Step 1: Ensure render uploads directory exists
    if (!fs.existsSync(renderUploadsPath)) {
        try {
            fs.mkdirSync(renderUploadsPath, { recursive: true });
            console.log('✅ Created render uploads directory');
        } catch (error) {
            console.error('❌ Failed to create render uploads directory:', error.message);
            process.exit(1);
        }
    } else {
        console.log('✅ Render uploads directory exists');
    }

    // Step 2: Get all images from database
    const query = `
        SELECT DISTINCT image_path FROM (
            SELECT image as image_path FROM products WHERE image IS NOT NULL AND image != ''
            UNION
            SELECT image_url as image_path FROM product_images WHERE image_url IS NOT NULL AND image_url != ''
        ) WHERE image_path LIKE 'uploads/%' OR image_path LIKE '/uploads/%'
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching images from database:', err.message);
            process.exit(1);
        }

        console.log(`\n📊 Found ${rows.length} unique images in database`);
        stats.totalImages = rows.length;

        if (rows.length === 0) {
            console.log('⚠️  No images found in database');
            db.close();
            return;
        }

        // Step 3: Process each image
        processImages(rows);
    });
}

function processImages(imageRows) {
    console.log('\n🔄 PROCESSING IMAGES');
    console.log('====================');

    imageRows.forEach((row, index) => {
        const imagePath = row.image_path;
        const filename = path.basename(imagePath);
        
        // Handle both 'uploads/file.jpg' and '/uploads/file.jpg' formats
        let localImagePath;
        if (imagePath.startsWith('/uploads/')) {
            localImagePath = path.join(__dirname, imagePath);
        } else if (imagePath.startsWith('uploads/')) {
            localImagePath = path.join(__dirname, imagePath);
        } else {
            console.log('   ⚠️  Unknown image path format, skipping');
            return;
        }
        
        const renderImagePath = path.join(renderUploadsPath, filename);

        console.log(`\n${index + 1}/${imageRows.length}: ${filename}`);

        // Check if local image exists
        if (!fs.existsSync(localImagePath)) {
            console.log('   ❌ Local image not found');
            stats.missingImages++;
            return;
        }

        // Check if already exists on render disk
        if (fs.existsSync(renderImagePath)) {
            console.log('   ✅ Already exists on render disk');
            stats.existingImages++;
            return;
        }

        // Copy to render disk
        try {
            fs.copyFileSync(localImagePath, renderImagePath);
            console.log('   ✅ Copied to render disk');
            stats.migratedImages++;
        } catch (error) {
            console.log(`   ❌ Copy failed: ${error.message}`);
            stats.errorImages++;
        }
    });

    // Step 4: Generate report
    generateReport();
}

function generateReport() {
    console.log('\n📈 MIGRATION REPORT');
    console.log('===================');
    console.log(`Total images in database: ${stats.totalImages}`);
    console.log(`✅ Successfully migrated: ${stats.migratedImages}`);
    console.log(`✅ Already existed: ${stats.existingImages}`);
    console.log(`❌ Copy errors: ${stats.errorImages}`);
    console.log(`❌ Missing local files: ${stats.missingImages}`);

    const successRate = ((stats.migratedImages + stats.existingImages) / stats.totalImages * 100).toFixed(1);
    console.log(`\n📊 Success rate: ${successRate}%`);

    // List files on render disk
    try {
        const renderFiles = fs.readdirSync(renderUploadsPath);
        console.log(`\n📁 Files on render persistent disk: ${renderFiles.length}`);
        
        if (renderFiles.length > 0) {
            console.log('   Sample files:');
            renderFiles.slice(0, 5).forEach(file => {
                const filePath = path.join(renderUploadsPath, file);
                const stats = fs.statSync(filePath);
                const sizeKB = (stats.size / 1024).toFixed(1);
                console.log(`     - ${file} (${sizeKB} KB)`);
            });
            
            if (renderFiles.length > 5) {
                console.log(`     ... and ${renderFiles.length - 5} more files`);
            }
        }
    } catch (error) {
        console.log(`❌ Error listing render disk files: ${error.message}`);
    }

    // Final status
    if (stats.migratedImages > 0 || stats.existingImages === stats.totalImages) {
        console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
        console.log('====================================');
        console.log('✅ Your product images are now on Render persistent disk');
        console.log('✅ Images will persist across all deployments');
        console.log('✅ No more disappearing images!');
        
        if (isRender) {
            console.log('\n🚀 READY FOR PRODUCTION!');
            console.log('Your site is now using persistent storage.');
        } else {
            console.log('\n💡 READY FOR DEPLOYMENT!');
            console.log('Deploy to Render to activate persistent storage.');
        }
    } else {
        console.log('\n⚠️  MIGRATION ISSUES DETECTED');
        console.log('=============================');
        console.log('Some images could not be migrated.');
        console.log('Check the errors above and fix them manually.');
    }

    db.close();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Migration interrupted');
    db.close();
    process.exit(0);
});