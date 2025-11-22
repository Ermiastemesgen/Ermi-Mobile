// Import products from JSON file to database
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

async function importProducts() {
    const filename = 'products-export.json';

    // Check if file exists
    if (!fs.existsSync(filename)) {
        console.error('❌ File not found:', filename);
        console.log('💡 Run export-products.js first to create the export file');
        db.close();
        return;
    }

    // Read the export file
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const products = data.products;
    const imagesByProduct = data.images;

    console.log(`📦 Found ${products.length} products to import`);
    console.log(`🖼️  Found ${data.totalImages} images to import\n`);

    let imported = 0;
    let skipped = 0;
    let imagesImported = 0;

    // Import each product
    for (const product of products) {
        await new Promise((resolve) => {
            // Check if product already exists (by name)
            db.get('SELECT id FROM products WHERE name = ?', [product.name], (err, existing) => {
                if (existing) {
                    console.log(`⏭️  Skipped: ${product.name} (already exists)`);
                    skipped++;
                    resolve();
                    return;
                }

                // Insert product
                db.run(
                    'INSERT INTO products (name, price, icon, stock, description, category_id, image, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [product.name, product.price, product.icon, product.stock, product.description, product.category_id, product.image, product.images],
                    function(err) {
                        if (err) {
                            console.error(`❌ Error importing ${product.name}:`, err.message);
                            resolve();
                            return;
                        }

                        const newProductId = this.lastID;
                        console.log(`✅ Imported: ${product.name}`);
                        imported++;

                        // Import images for this product
                        const images = imagesByProduct[product.id] || [];
                        if (images.length > 0) {
                            const stmt = db.prepare('INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)');
                            images.forEach(img => {
                                stmt.run(newProductId, img.image_url, img.display_order);
                                imagesImported++;
                            });
                            stmt.finalize();
                            console.log(`   📸 Imported ${images.length} images`);
                        }

                        resolve();
                    }
                );
            });
        });
    }

    // Wait a bit for all operations to complete
    setTimeout(() => {
        console.log('\n📊 Import Summary:');
        console.log(`   ✅ Imported: ${imported} products`);
        console.log(`   ⏭️  Skipped: ${skipped} products (already exist)`);
        console.log(`   🖼️  Images: ${imagesImported} imported`);
        console.log(`   📦 Total: ${products.length} products processed\n`);
        console.log('✅ Import complete!');
        db.close();
    }, 1000);
}

console.log('📥 Importing products to database...\n');
importProducts();
