// Auto-seed Railway Database on Startup
// This runs automatically when Railway starts

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🌱 Auto-seeding Railway database...');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        return;
    }
    
    // Check if products already exist
    db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking products:', err.message);
            db.close();
            return;
        }
        
        if (row.count > 0) {
            console.log(`ℹ️  Database already has ${row.count} products - skipping seed`);
            db.close();
            return;
        }
        
        console.log('📦 Database is empty - seeding products and categories...');
        seedDatabase();
    });
});

function seedDatabase() {
    // Seed categories first
    const categories = JSON.parse(fs.readFileSync('seed-categories.json', 'utf8'));
    
    console.log(`📂 Seeding ${categories.length} categories...`);
    
    const catStmt = db.prepare('INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)');
    
    categories.forEach(cat => {
        catStmt.run(cat.name, cat.description, cat.parent_id, (err) => {
            if (err) {
                console.error(`❌ Error seeding category ${cat.name}:`, err.message);
            } else {
                console.log(`✅ Seeded category: ${cat.name}`);
            }
        });
    });
    
    catStmt.finalize(() => {
        // Seed products after categories
        const products = JSON.parse(fs.readFileSync('seed-products.json', 'utf8'));
        
        console.log(`📦 Seeding ${products.length} products...`);
        
        const prodStmt = db.prepare('INSERT INTO products (name, price, icon, description, stock, category_id, image) VALUES (?, ?, ?, ?, ?, ?, ?)');
        
        products.forEach(prod => {
            prodStmt.run(
                prod.name,
                prod.price,
                prod.icon,
                prod.description,
                prod.stock,
                prod.category_id,
                prod.image || null,
                (err) => {
                    if (err) {
                        console.error(`❌ Error seeding product ${prod.name}:`, err.message);
                    } else {
                        console.log(`✅ Seeded product: ${prod.name}${prod.image ? ' 📸' : ''}`);
                    }
                }
            );
        });
        
        prodStmt.finalize(() => {
            console.log('🎉 Auto-seeding complete!');
            db.close();
        });
    });
}
