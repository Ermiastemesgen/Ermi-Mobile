const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to database\n');
        
        // Create categories table
        db.run(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating categories table:', err.message);
            } else {
                console.log('✅ Categories table created');
                
                // Insert default categories
                const categories = [
                    { name: 'Audio', description: 'Headphones, earbuds, and speakers' },
                    { name: 'Cases & Protection', description: 'Phone cases and screen protectors' },
                    { name: 'Charging', description: 'Chargers and power banks' },
                    { name: 'Wearables', description: 'Smart watches and fitness trackers' }
                ];
                
                const stmt = db.prepare('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)');
                categories.forEach(cat => {
                    stmt.run(cat.name, cat.description);
                });
                stmt.finalize(() => {
                    console.log('✅ Default categories inserted\n');
                    
                    // Add category_id column to products
                    db.run('ALTER TABLE products ADD COLUMN category_id INTEGER', (err) => {
                        if (err) {
                            if (err.message.includes('duplicate column name')) {
                                console.log('✅ Category column already exists');
                            } else {
                                console.error('❌ Error adding category column:', err.message);
                            }
                        } else {
                            console.log('✅ Category column added to products');
                        }
                        
                        // Update existing products with categories
                        db.run("UPDATE products SET category_id = 1 WHERE name LIKE '%Earbuds%' OR name LIKE '%Headphones%'");
                        db.run("UPDATE products SET category_id = 2 WHERE name LIKE '%Case%' OR name LIKE '%Protector%'");
                        db.run("UPDATE products SET category_id = 3 WHERE name LIKE '%Charger%' OR name LIKE '%Power Bank%'");
                        db.run("UPDATE products SET category_id = 4 WHERE name LIKE '%Watch%'", () => {
                            console.log('✅ Products updated with categories\n');
                            
                            // Show results
                            db.all('SELECT * FROM categories', [], (err, rows) => {
                                console.log('📋 Categories:');
                                rows.forEach(cat => {
                                    console.log(`  ${cat.id}. ${cat.name} - ${cat.description}`);
                                });
                                console.log('');
                                
                                db.all(`
                                    SELECT p.id, p.name, c.name as category 
                                    FROM products p 
                                    LEFT JOIN categories c ON p.category_id = c.id
                                `, [], (err, rows) => {
                                    console.log('📦 Products with Categories:');
                                    rows.forEach(prod => {
                                        console.log(`  ${prod.id}. ${prod.name} → ${prod.category || 'No category'}`);
                                    });
                                    db.close();
                                });
                            });
                        });
                    });
                });
            }
        });
    }
});
