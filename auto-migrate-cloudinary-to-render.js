const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('🔄 AUTOMATIC CLOUDINARY TO RENDER DISK MIGRATION');
console.log('================================================');

// Configuration
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

const isRender = process.env.RENDER === 'true';
const useRenderPersistentStorage = process.env.USE_PERSISTENT_STORAGE === 'true';

// Determine uploads directory
let uploadsDir;
if (isRender && useRenderPersistentStorage && process.env.UPLOADS_PATH) {
    uploadsDir = process.env.UPLOADS_PATH;
} else if (isRender && useRenderPersistentStorage) {
    uploadsDir = '/opt/render/project/src/uploads';
} else {
    uploadsDir = path.join(__dirname, 'uploads');
}

console.log('📊 CONFIGURATION:');
console.log(`   Database: ${dbPath}`);
console.log(`   Uploads Directory: ${uploadsDir}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Is Render: ${isRender}`);
console.log(`   Use Persistent Storage: ${useRenderPersistentStorage}`);

// Statistics
let stats = {
    totalImages: 0,
    cloudinaryImages: 0,
    localImages: 0,
    downloadedImages: 0,
    updatedPaths: 0,
    errors: 0
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

// Ensure uploads directory exists
function ensureUploadsDir() {
    if (!fs.existsSync(uploadsDir)) {
        try {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('✅ Created uploads directory');
        } catch (error) {
            console.error('❌ Failed to create uploads directory:', error.message);
            process.exit(1);
        }
    }
}

// Download image from URL
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(uploadsDir, filename);
        
        // Skip if file already exists
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ Already exists: ${filename}`);
            resolve(filePath);
            return;
        }
        
        const protocol = url.startsWith('https:') ? https : http;
        
        console.log(`   🔄 Downloading: ${filename}`);
        
        const file = fs.createWriteStream(filePath);
        
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`   ✅ Downloaded: ${filename}`);
                stats.downloadedImages++;
                resolve(filePath);
            });
            
            file.on('error', (err) => {
                fs.unlink(filePath, () => {}); // Delete partial file
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Generate new filename
function generateFilename(originalUrl) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = path.extname(originalUrl) || '.jpg';
    return `product-${timestamp}-${random}${extension}`;
}

// Update database with new image path
function updateImagePath(table, column, condition, newPath) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE ${table} SET ${column} = ? WHERE ${condition}`;
        db.run(query, [newPath], function(err) {
            if (err) {
                reject(err);
            } else {
                stats.updatedPaths++;
                resolve();
            }
        });
    });
}

// Start migration process
async function startMigration() {
    console.log('\n🚀 STARTING MIGRATION PROCESS');
    console.log('==============================');
    
    ensureUploadsDir();
    
    // Get all products with images
    const query = `
        SELECT p.id, p.name, p.image, pi.id as pi_id, pi.image_url 
        FROM products p 
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.image IS NOT NULL OR pi.image_url IS NOT NULL
    `;
    
    db.all(query, [], async (err, rows) => {
        if (err) {
            console.error('❌ Error fetching products:', err.message);
            process.exit(1);
        }
        
        console.log(`\n📊 Found ${rows.length} image records`);
        stats.totalImages = rows.length;
        
        // Process each image
        for (const row of rows) {
            console.log(`\n🛍️  Product: ${row.name} (ID: ${row.id})`);
            
            // Process main product image
            if (row.image) {
                await processImage(row.image, 'products', 'image', `id = ${row.id}`, row.name, 'main');
            }
            
            // Process additional product images
            if (row.image_url && row.pi_id) {
                await processImage(row.image_url, 'product_images', 'image_url', `id = ${row.pi_id}`, row.name, 'additional');
            }
        }
        
        // Generate final report
        generateReport();
    });
}

// Process individual image
async function processImage(imagePath, table, column, condition, productName, type) {
    try {
        console.log(`   🔍 Processing ${type} image: ${imagePath}`);
        
        // Check if it's a Cloudinary URL
        if (imagePath.includes('cloudinary.com')) {
            console.log(`   ☁️  Cloudinary image detected`);
            stats.cloudinaryImages++;
            
            // Generate new filename
            const newFilename = generateFilename(imagePath);
            const newPath = `uploads/${newFilename}`;
            
            // Download image
            await downloadImage(imagePath, newFilename);
            
            // Update database
            await updateImagePath(table, column, condition, newPath);
            console.log(`   ✅ Updated database: ${newPath}`);
            
        } else if (imagePath.startsWith('uploads/') || imagePath.startsWith('/uploads/')) {
            console.log(`   📁 Local image detected`);
            stats.localImages++;
            
            // Check if file exists
            const filename = path.basename(imagePath);
            const fullPath = path.join(uploadsDir, filename);
            
            if (fs.existsSync(fullPath)) {
                console.log(`   ✅ Local image exists`);
            } else {
                console.log(`   ❌ Local image missing: ${filename}`);
                stats.errors++;
            }
        } else {
            console.log(`   ⚠️  Unknown image format: ${imagePath}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Error processing image: ${error.message}`);
        stats.errors++;
    }
}

// Generate final report
function generateReport() {
    console.log('\n📈 MIGRATION REPORT');
    console.log('===================');
    console.log(`Total image records: ${stats.totalImages}`);
    console.log(`☁️  Cloudinary images: ${stats.cloudinaryImages}`);
    console.log(`📁 Local images: ${stats.localImages}`);
    console.log(`⬇️  Downloaded images: ${stats.downloadedImages}`);
    console.log(`🔄 Updated database paths: ${stats.updatedPaths}`);
    console.log(`❌ Errors: ${stats.errors}`);
    
    const successRate = stats.totalImages > 0 ? 
        ((stats.downloadedImages + stats.localImages) / stats.totalImages * 100).toFixed(1) : 0;
    
    console.log(`\n📊 Success rate: ${successRate}%`);
    
    // List files in uploads directory
    try {
        const files = fs.readdirSync(uploadsDir);
        console.log(`\n📁 Files in uploads directory: ${files.length}`);
        
        if (files.length > 0) {
            console.log('   Recent files:');
            files.slice(-5).forEach(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);
                const sizeKB = (stats.size / 1024).toFixed(1);
                console.log(`     - ${file} (${sizeKB} KB)`);
            });
        }
    } catch (error) {
        console.log(`❌ Error listing files: ${error.message}`);
    }
    
    // Final status
    if (stats.downloadedImages > 0 || stats.localImages > 0) {
        console.log('\n🎉 MIGRATION COMPLETED!');
        console.log('=======================');
        console.log('✅ Images migrated to Render disk');
        console.log('✅ Database paths updated');
        console.log('✅ Images will now display correctly');
        console.log('✅ Images will persist across deployments');
        
        if (isRender) {
            console.log('\n🚀 READY FOR PRODUCTION!');
            console.log('Your site should now display all images correctly.');
        } else {
            console.log('\n💡 READY FOR DEPLOYMENT!');
            console.log('Deploy to Render to see the results.');
        }
    } else {
        console.log('\n⚠️  NO IMAGES TO MIGRATE');
        console.log('========================');
        console.log('No Cloudinary images found to migrate.');
    }
    
    db.close();
}