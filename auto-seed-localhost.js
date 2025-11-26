const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'emobile.db');
const db = new sqlite3.Database(dbPath);

// Load seed data
const seedProducts = require('./seed-products.json');
const seedCategories = require('./seed-categories.json');

console.log('🌱 Auto-seeding localhost database...');

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
    
    const categoryStmt = db.prepare(`
        INSERT OR IGNORE INTO categories (name, description, image_url, parent_id)
        VALUES (?, ?, ?, ?)
    `);

    seedCategories.forEach(cat => {
        categoryStmt.run(cat.name, cat.description, cat.image_url, cat.parent_id, (err) => {
            if (err) {
                console.error(`❌ Error seeding category ${cat.name}:`, err);
            } else {
                console.log(`✅ Seeded category: ${cat.name}`);
            }
        });
    });

    categoryStmt.finalize(() => {
        // Seed products
        console.log(`📦 Seeding ${seedProducts.length} products...`);
        
        const productStmt = db.prepare(`
            INSERT OR IGNORE INTO products (name, description, price, category_id, stock, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        seedProducts.forEach(product => {
            productStmt.run(
                product.name,
                product.description,
                product.price,
                product.category_id,
                product.stock,
                product.image_url,
                (err) => {
                    if (err) {
                        console.error(`❌ Error seeding product ${product.name}:`, err);
                    } else {
                        console.log(`✅ Seeded product: ${product.name}`);
                    }
                }
            );
        });

        productStmt.finalize(() => {
            console.log('🎉 Auto-seeding complete!');
            db.close();
        });
    });
});
