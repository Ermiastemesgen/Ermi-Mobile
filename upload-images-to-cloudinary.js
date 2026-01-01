const sqlite3 = require('sqlite3').verbose();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🖼️  Upload Product Images to Cloudinary');
console.log('=========================================\n');

// Ask for Cloudinary credentials
rl.question('Enter Cloudinary Cloud Name: ', (cloudName) => {
    rl.question('Enter Cloudinary API Key: ', (apiKey) => {
        rl.question('Enter Cloudinary API Secret: ', (apiSecret) => {
            rl.close();
            
            // Configure Cloudinary
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret
            });
            
            console.log('\n✅ Cloudinary configured\n');
            uploadImages();
        });
    });
});

function uploadImages() {
    const db = new sqlite3.Database('./emobile.db', (err) => {
        if (err) {
            console.error('❌ Error opening database:', err.message);
            process.exit(1);
        }
    });

    console.log('📦 Reading products with local images...\n');
    
    db.all('SELECT * FROM products WHERE image LIKE "uploads/%"', [], async (err, products) => {
        if (err) {
            console.error('❌ Error reading products:', err.message);
            db.close();
            return;
        }

        if (products.length === 0) {
            console.log('✅ No products with local images found');
            db.close();
            return;
        }

        console.log(`Found ${products.length} products with local images:\n`);
        
        for (const product of products) {
            console.log(`📸 ${product.name}`);
            console.log(`   Local: ${product.image}`);
            
            const imagePath = path.join(__dirname, product.image);
            
            if (!fs.existsSync(imagePath)) {
                console.log(`   ❌ File not found: ${imagePath}\n`);
                continue;
            }

            try {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(imagePath, {
                    folder: 'ermi-mobile',
                    public_id: `product-${product.id}-${Date.now()}`
                });
                
                console.log(`   ✅ Uploaded: ${result.secure_url}`);
                
                // Update database
                db.run(
                    'UPDATE products SET image = ? WHERE id = ?',
                    [result.secure_url, product.id],
                    (err) => {
                        if (err) {
                            console.log(`   ❌ Failed to update database`);
                        } else {
                            console.log(`   ✅ Database updated\n`);
                        }
                    }
                );
            } catch (error) {
                console.log(`   ❌ Upload failed: ${error.message}\n`);
            }
        }
        
        setTimeout(() => {
            console.log('=========================================');
            console.log('✅ Upload complete!');
            console.log('=========================================\n');
            console.log('Next steps:');
            console.log('1. Run: node show-local-products.js');
            console.log('2. Verify images are Cloudinary URLs');
            console.log('3. Run: import-complete.bat');
            console.log('4. Import to Render with new URLs\n');
            db.close();
        }, 2000);
    });
}
