const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'emobile.db');
const db = new sqlite3.Database(dbPath);

// Load seed data
const seedProducts = require('./seed-products.json');
const seedCategories = require('./seed-categories.json');

console.log('🌱 Auto-seeding localhost database...');

// Use serialize to ensure operations run in order
db.serialize(() => {
    // Check if database has products
    db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking products:', err);
            db.close();
            return;
        }

        if (row.count > 0) {
            console.log(`ℹ️  Database already has ${row.count} products - skipping auto-seed`);
            db.close();
            return;
        }

        console.log('📦 Database is empty - seeding products and categories...');

        // Seed categories first
        console.log(`📂 Seeding ${seedCategories.length} categories...`);
        
        db.serialize(() => {
            const categoryStmt = db.prepare(`
                INSERT OR IGNORE INTO categories (name, description, parent_id)
                VALUES (?, ?, ?)
            `);

            seedCategories.forEach(cat => {
                categoryStmt.run(cat.name, cat.description, cat.parent_id);
                console.log(`✅ Seeded category: ${cat.name}`);
            });

            categoryStmt.finalize();

            // Seed products
            console.log(`📦 Seeding ${seedProducts.length} products...`);
            
            const productStmt = db.prepare(`
                INSERT INTO products (name, description, price, category_id, stock, icon)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            seedProducts.forEach(product => {
                productStmt.run(
                    product.name,
                    product.description,
                    product.price,
                    product.category_id,
                    product.stock,
                    product.icon
                );
                console.log(`✅ Seeded product: ${product.name}`);
            });

            productStmt.finalize(() => {
                console.log('🎉 Auto-seeding complete!');
                db.close();
            });
        });
    });
});
