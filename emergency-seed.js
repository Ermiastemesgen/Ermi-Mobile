const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
        return;
    }
    
    console.log('✅ Connected to database');
    
    // Check if products exist
    db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
        if (err) {
            console.error('❌ Error:', err.message);
            return;
        }
        
        console.log(`📊 Products in database: ${row.count}`);
        
        if (row.count === 0) {
            console.log('🌱 Adding emergency products...');
            
            const products = [
                ['Wireless Earbuds', 1800, 'High-quality wireless earbuds', 'uploads/placeholder.jpg', 100, 'fa-headphones'],
                ['Phone Case', 1000, 'Protective phone case', 'uploads/placeholder.jpg', 50, 'fa-mobile-alt'],
                ['Fast Charger', 1400, '30W fast charger', 'uploads/placeholder.jpg', 75, 'fa-plug'],
                ['Bluetooth Speaker', 3500, 'Portable speaker', 'uploads/placeholder.jpg', 30, 'fa-volume-up'],
                ['Smart Watch', 1500, 'Smartwatch with health tracking', 'uploads/placeholder.jpg', 25, 'fa-clock']
            ];
            
            const stmt = db.prepare("INSERT INTO products (name, price, description, image, stock, icon) VALUES (?, ?, ?, ?, ?, ?)");
            
            products.forEach(product => {
                stmt.run(product, (err) => {
                    if (err) {
                        console.error(`❌ Error inserting ${product[0]}:`, err.message);
                    } else {
                        console.log(`✅ Added ${product[0]}`);
                    }
                });
            });
            
            stmt.finalize(() => {
                console.log('🎉 Emergency products added!');
                db.close();
            });
        } else {
            console.log('✅ Products already exist');
            db.close();
        }
    });
});