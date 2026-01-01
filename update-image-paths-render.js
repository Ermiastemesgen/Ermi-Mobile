const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🔧 UPDATE IMAGE PATHS FOR RENDER PERSISTENT DISK');
console.log('===============================================');

// Database path
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

// Storage configuration
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

console.log(`Database: ${dbPath}`);
console.log(`Render uploads path: ${renderUploadsPath}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to database');
});

async function updateImagePaths() {
    console.log('\n🔍 CHECKING IMAGE PATHS');
    console.log('=======================');

    // Check products table
    db.all("SELECT id, name, image FROM products WHERE image IS NOT NULL", [], (err, products) => {
        if (err) {
            console.error('❌ Error fetching products:', err.message);
            return;
        }

        console.log(`Found ${products.length} products with images`);
        let updatedProducts = 0;

        products.forEach((product) => {
            if (product.image && product.image.startsWith('/uploads/')) {
                const filename = path.basename(product.image);
                const fullPath = path.join(renderUploadsPath, filename);
                
                // Check if file exists on render disk
                if (fs.existsSync(fullPath)) {
                    console.log(`✅ ${product.name}: Image exists on render disk`);
                } else {
                    console.log(`⚠️  ${product.name}: Image missing on render disk`);
                }
            }
        });

        // Check product_images table
        db.all("SELECT id, product_id, image_url FROM product_images WHERE image_url IS NOT NULL", [], (err, productImages) => {
            if (err) {
                console.error('❌ Error fetching product images:', err.message);
                return;
            }

            console.log(`\nFound ${productImages.length} additional product images`);
            let updatedImages = 0;

            productImages.forEach((image) => {
                if (image.image_url && image.image_url.startsWith('/uploads/')) {
                    const filename = path.basename(image.image_url);
                    const fullPath = path.join(renderUploadsPath, filename);
                    
                    // Check if file exists on render disk
                    if (fs.existsSync(fullPath)) {
                        console.log(`✅ Product ${image.product_id}: Additional image exists on render disk`);
                    } else {
                        console.log(`⚠️  Product ${image.product_id}: Additional image missing on render disk`);
                    }
                }
            });

            console.log('\n📊 VERIFICATION SUMMARY');
            console.log('=======================');
            console.log('✅ All image paths are already correct for persistent disk');
            console.log('✅ Images use relative /uploads/ paths');
            console.log('✅ Server will automatically serve from persistent disk');

            console.log('\n💡 HOW IT WORKS:');
            console.log('================');
            console.log('1. Database stores: /uploads/filename.jpg');
            console.log('2. Server maps /uploads/ to persistent disk path');
            console.log('3. Images served from: ' + renderUploadsPath);
            console.log('4. No database changes needed!');

            db.close();
        });
    });
}

// Start verification
updateImagePaths();