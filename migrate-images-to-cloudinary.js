// ===== MIGRATE IMAGES TO CLOUDINARY =====
// This script helps migrate existing local images to Cloudinary

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// ===== Configuration =====
const dbPath = process.env.DATABASE_PATH || './emobile.db';

// Check if Cloudinary is configured
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

if (!useCloudinary) {
    console.error('❌ Cloudinary not configured!');
    console.log('Please set these environment variables:');
    console.log('- CLOUDINARY_CLOUD_NAME');
    console.log('- CLOUDINARY_API_KEY');
    console.log('- CLOUDINARY_API_SECRET');
    process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️  Cloudinary configured successfully!');

// ===== Database Connection =====
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to database');
    }
});

// ===== Migration Functions =====

async function uploadToCloudinary(localPath, productId, imageIndex = 0) {
    try {
        const fullPath = path.join(__dirname, localPath);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  File not found: ${fullPath}`);
            return null;
        }

        console.log(`📤 Uploading: ${localPath}`);
        
        const result = await cloudinary.uploader.upload(fullPath, {
            folder: 'ermi-mobile',
            public_id: `product-${productId}-${imageIndex}-${Date.now()}`,
            transformation: [
                { width: 2000, height: 2000, crop: 'limit', quality: 'auto' }
            ]
        });

        console.log(`✅ Uploaded: ${result.secure_url}`);
        return result.secure_url;
        
    } catch (error) {
        console.error(`❌ Upload failed for ${localPath}:`, error.message);
        return null;
    }
}

async function migrateProductImages() {
    return new Promise((resolve, reject) => {
        console.log('\n🔄 Starting product image migration...\n');
        
        db.all('SELECT id, name, image FROM products WHERE image IS NOT NULL AND image != ""', [], async (err, products) => {
            if (err) {
                reject(err);
                return;
            }

            console.log(`📊 Found ${products.length} products with images`);
            
            let migrated = 0;
            let failed = 0;
            let skipped = 0;

            for (const product of products) {
                console.log(`\n🔄 Processing: ${product.name} (ID: ${product.id})`);
                
                // Skip if already using Cloudinary
                if (product.image.startsWith('https://res.cloudinary.com')) {
                    console.log(`⏭️  Already using Cloudinary, skipping`);
                    skipped++;
                    continue;
                }

                // Upload to Cloudinary
                const cloudinaryUrl = await uploadToCloudinary(product.image, product.id);
                
                if (cloudinaryUrl) {
                    // Update database
                    db.run(
                        'UPDATE products SET image = ? WHERE id = ?',
                        [cloudinaryUrl, product.id],
                        (err) => {
                            if (err) {
                                console.error(`❌ Database update failed for product ${product.id}:`, err.message);
                                failed++;
                            } else {
                                console.log(`✅ Database updated for: ${product.name}`);
                                migrated++;
                            }
                        }
                    );
                } else {
                    failed++;
                }
            }

            // Wait a bit for database operations to complete
            setTimeout(() => {
                console.log('\n📊 Migration Summary:');
                console.log(`✅ Migrated: ${migrated}`);
                console.log(`⏭️  Skipped: ${skipped}`);
                console.log(`❌ Failed: ${failed}`);
                console.log(`📊 Total: ${products.length}`);
                resolve({ migrated, skipped, failed, total: products.length });
            }, 2000);
        });
    });
}

async function migrateProductImagesTable() {
    return new Promise((resolve, reject) => {
        console.log('\n🔄 Starting product_images table migration...\n');
        
        db.all('SELECT * FROM product_images WHERE image_url NOT LIKE "https://res.cloudinary.com%"', [], async (err, images) => {
            if (err) {
                reject(err);
                return;
            }

            console.log(`📊 Found ${images.length} images in product_images table`);
            
            let migrated = 0;
            let failed = 0;

            for (const image of images) {
                console.log(`\n🔄 Processing image ID: ${image.id} for product ${image.product_id}`);
                
                // Upload to Cloudinary
                const cloudinaryUrl = await uploadToCloudinary(image.image_url, image.product_id, image.id);
                
                if (cloudinaryUrl) {
                    // Update database
                    db.run(
                        'UPDATE product_images SET image_url = ? WHERE id = ?',
                        [cloudinaryUrl, image.id],
                        (err) => {
                            if (err) {
                                console.error(`❌ Database update failed for image ${image.id}:`, err.message);
                                failed++;
                            } else {
                                console.log(`✅ Database updated for image ID: ${image.id}`);
                                migrated++;
                            }
                        }
                    );
                } else {
                    failed++;
                }
            }

            // Wait a bit for database operations to complete
            setTimeout(() => {
                console.log('\n📊 Product Images Migration Summary:');
                console.log(`✅ Migrated: ${migrated}`);
                console.log(`❌ Failed: ${failed}`);
                console.log(`📊 Total: ${images.length}`);
                resolve({ migrated, failed, total: images.length });
            }, 2000);
        });
    });
}

async function cleanupLocalImages() {
    console.log('\n🧹 Cleaning up local images...');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        let cleaned = 0;
        
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            try {
                fs.unlinkSync(filePath);
                cleaned++;
            } catch (error) {
                console.error(`❌ Failed to delete ${file}:`, error.message);
            }
        });
        
        console.log(`🧹 Cleaned up ${cleaned} local image files`);
    } else {
        console.log('📁 No uploads directory found');
    }
}

// ===== Main Migration Process =====
async function runMigration() {
    try {
        console.log('🚀 Starting Image Migration to Cloudinary\n');
        console.log('📋 Migration Plan:');
        console.log('1. Migrate main product images');
        console.log('2. Migrate product_images table');
        console.log('3. Clean up local files (optional)\n');
        
        // Step 1: Migrate main product images
        const productResults = await migrateProductImages();
        
        // Step 2: Migrate product_images table
        const imageResults = await migrateProductImagesTable();
        
        // Step 3: Ask about cleanup
        console.log('\n❓ Do you want to clean up local image files? (y/N)');
        
        // For now, skip cleanup (you can uncomment if needed)
        // await cleanupLocalImages();
        
        console.log('\n🎉 Migration Complete!');
        console.log('\n📊 Final Summary:');
        console.log(`Products migrated: ${productResults.migrated}/${productResults.total}`);
        console.log(`Images migrated: ${imageResults.migrated}/${imageResults.total}`);
        console.log('\n✅ All images are now stored in Cloudinary!');
        console.log('🚀 Your images will persist across deployments!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        db.close();
    }
}

// ===== Verification Function =====
async function verifyMigration() {
    console.log('\n🔍 Verifying migration...\n');
    
    db.all('SELECT id, name, image FROM products WHERE image IS NOT NULL', [], (err, products) => {
        if (err) {
            console.error('❌ Verification failed:', err.message);
            return;
        }
        
        let cloudinaryCount = 0;
        let localCount = 0;
        
        products.forEach(product => {
            if (product.image.startsWith('https://res.cloudinary.com')) {
                cloudinaryCount++;
                console.log(`✅ ${product.name}: Using Cloudinary`);
            } else {
                localCount++;
                console.log(`⚠️  ${product.name}: Still using local storage`);
            }
        });
        
        console.log('\n📊 Verification Results:');
        console.log(`✅ Cloudinary: ${cloudinaryCount}`);
        console.log(`⚠️  Local: ${localCount}`);
        
        if (localCount === 0) {
            console.log('\n🎉 All images successfully migrated to Cloudinary!');
        } else {
            console.log('\n⚠️  Some images still need migration');
        }
        
        db.close();
    });
}

// ===== Command Line Interface =====
const command = process.argv[2];

switch (command) {
    case 'migrate':
        runMigration();
        break;
    case 'verify':
        verifyMigration();
        break;
    case 'help':
    default:
        console.log('🖼️  Image Migration Tool\n');
        console.log('Usage:');
        console.log('  node migrate-images-to-cloudinary.js migrate  - Migrate images to Cloudinary');
        console.log('  node migrate-images-to-cloudinary.js verify   - Verify migration status');
        console.log('  node migrate-images-to-cloudinary.js help     - Show this help\n');
        console.log('Before running:');
        console.log('1. Set up Cloudinary account at https://cloudinary.com');
        console.log('2. Add CLOUDINARY_* environment variables to .env file');
        console.log('3. Run: node migrate-images-to-cloudinary.js migrate');
        break;
}