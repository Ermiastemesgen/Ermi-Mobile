// Sync existing product images to product_images table
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database');
});

// Sync images from products table to product_images table
db.all('SELECT id, image FROM products WHERE image IS NOT NULL AND image != ""', [], (err, products) => {
    if (err) {
        console.error('❌ Error fetching products:', err.message);
        db.close();
        return;
    }

    console.log(`📦 Found ${products.length} products with images`);

    if (products.length === 0) {
        console.log('✅ No products to sync');
        db.close();
        return;
    }

    let synced = 0;
    let skipped = 0;

    products.forEach((product, index) => {
        // Check if this product already has images in product_images table
        db.get('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?', [product.id], (err, row) => {
            if (err) {
                console.error(`❌ Error checking product ${product.id}:`, err.message);
                return;
            }

            if (row.count > 0) {
                console.log(`⏭️  Product ${product.id} already has ${row.count} image(s) in product_images table`);
                skipped++;
            } else {
                // Insert the image into product_images table
                db.run(
                    'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
                    [product.id, product.image, 0],
                    (err) => {
                        if (err) {
                            console.error(`❌ Error syncing product ${product.id}:`, err.message);
                        } else {
                            console.log(`✅ Synced image for product ${product.id}`);
                            synced++;
                        }

                        // Check if this is the last product
                        if (index === products.length - 1) {
                            setTimeout(() => {
                                console.log('\n📊 Sync Summary:');
                                console.log(`   ✅ Synced: ${synced} products`);
                                console.log(`   ⏭️  Skipped: ${skipped} products (already had images)`);
                                console.log(`   📦 Total: ${products.length} products`);
                                db.close();
                            }, 500);
                        }
                    }
                );
            }

            // Check if this is the last product and all were skipped
            if (index === products.length - 1 && skipped === products.length) {
                setTimeout(() => {
                    console.log('\n📊 Sync Summary:');
                    console.log(`   ✅ Synced: ${synced} products`);
                    console.log(`   ⏭️  Skipped: ${skipped} products (already had images)`);
                    console.log(`   📦 Total: ${products.length} products`);
                    db.close();
                }, 500);
            }
        });
    });
});
