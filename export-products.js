// Export products from local database to JSON file
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

async function exportProducts() {
    // Get all products
    db.all('SELECT * FROM products', [], (err, products) => {
        if (err) {
            console.error('❌ Error fetching products:', err.message);
            db.close();
            return;
        }

        if (products.length === 0) {
            console.log('⚠️  No products found to export');
            db.close();
            return;
        }

        // Get all product images
        db.all('SELECT * FROM product_images ORDER BY product_id, display_order', [], (err, images) => {
            if (err) {
                console.error('❌ Error fetching images:', err.message);
                db.close();
                return;
            }

            // Group images by product_id
            const imagesByProduct = {};
            images.forEach(img => {
                if (!imagesByProduct[img.product_id]) {
                    imagesByProduct[img.product_id] = [];
                }
                imagesByProduct[img.product_id].push(img);
            });

            // Combine products with their images
            const exportData = {
                products: products,
                images: imagesByProduct,
                exportDate: new Date().toISOString(),
                totalProducts: products.length,
                totalImages: images.length
            };

            // Write to JSON file
            const filename = 'products-export.json';
            fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));

            console.log('✅ Products exported successfully!\n');
            console.log(`📦 Total products: ${products.length}`);
            console.log(`🖼️  Total images: ${images.length}`);
            console.log(`📄 File: ${filename}\n`);
            console.log('Products exported:');
            products.forEach((p, i) => {
                const imgCount = imagesByProduct[p.id] ? imagesByProduct[p.id].length : 0;
                console.log(`  ${i + 1}. ${p.name} - ${p.price} Birr (${imgCount} images)`);
            });

            console.log('\n💡 Next step: Upload this file to Render and run import-products.js');

            db.close();
        });
    });
}

console.log('📤 Exporting products from local database...\n');
exportProducts();
