// Auto-seed Railway Database on Startup
// This runs automatically when Railway starts

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🌱 Auto-seeding Railway database...');
console.log('📍 Database path:', dbPath);

// Wrap everything in try-catch to prevent crashes
try {
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        console.log(`📁 Creating directory: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Wait a bit for tables to be created
    setTimeout(() => {
        try {
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Error opening database:', err.message);
                    console.log('ℹ️  Auto-seed will be skipped');
                    return;
                }
                
                console.log('✅ Database connection established');
                
                // Check if products table exists
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'", [], (err, row) => {
                    if (err) {
                        console.error('❌ Error checking tables:', err.message);
                        db.close();
                        return;
                    }
                    
                    if (!row) {
                        console.log('⚠️  Products table does not exist yet - skipping auto-seed');
                        console.log('ℹ️  Tables will be created by server initialization');
                        db.close();
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
                        seedDatabase(db);
                    });
                });
            });
        } catch (error) {
            console.error('❌ Auto-seed error:', error.message);
            console.log('ℹ️  Server will continue without auto-seed');
        }
    }, 5000); // Wait 5 seconds for tables to be created
} catch (error) {
    console.error('❌ Auto-seed initialization error:', error.message);
    console.log('ℹ️  Server will continue without auto-seed');
}

function seedDatabase(db) {
    try {
        // Check if seed files exist
        if (!fs.existsSync('seed-categories.json') || !fs.existsSync('seed-products.json')) {
            console.error('❌ Seed files not found');
            db.close();
            return;
        }

        // Seed categories first
        const categories = JSON.parse(fs.readFileSync('seed-categories.json', 'utf8'));
        
        console.log(`📂 Seeding ${categories.length} categories...`);
        
        db.serialize(() => {
            const catStmt = db.prepare('INSERT OR IGNORE INTO categories (name, description, parent_id) VALUES (?, ?, ?)');
            
            categories.forEach(cat => {
                catStmt.run(cat.name, cat.description, cat.parent_id);
                console.log(`✅ Seeded category: ${cat.name}`);
            });
            
            catStmt.finalize((err) => {
                if (err) {
                    console.error('❌ Error finalizing categories:', err.message);
                    db.close();
                    return;
                }

                // Seed products after categories
                const products = JSON.parse(fs.readFileSync('seed-products.json', 'utf8'));
                
                console.log(`📦 Seeding ${products.length} products...`);
                
                const prodStmt = db.prepare('INSERT OR IGNORE INTO products (name, price, icon, description, stock, category_id, image) VALUES (?, ?, ?, ?, ?, ?, ?)');
                
                products.forEach(prod => {
                    prodStmt.run(
                        prod.name,
                        prod.price,
                        prod.icon,
                        prod.description,
                        prod.stock,
                        prod.category_id,
                        prod.image || null
                    );
                    console.log(`✅ Seeded product: ${prod.name}${prod.image ? ' 📸' : ''}`);
                });
                
                prodStmt.finalize((err) => {
                    if (err) {
                        console.error('❌ Error finalizing products:', err.message);
                    } else {
                        console.log('🎉 Auto-seeding complete!');
                    }
                    db.close();
                });
            });
        });
    } catch (error) {
        console.error('❌ Seed database error:', error.message);
        db.close();
    }
}
