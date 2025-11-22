const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./emobile.db');

console.log('Adding product images support...');

db.serialize(() => {
    // Create product_images table
    db.run(`
        CREATE TABLE IF NOT EXISTS product_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            is_primary INTEGER DEFAULT 0,
            display_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating product_images table:', err.message);
        } else {
            console.log('✅ Product images table created');
        }
    });

    // Add images column to products table (for backward compatibility)
    db.run(`ALTER TABLE products ADD COLUMN images TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding images column:', err.message);
        } else {
            console.log('✅ Images column added to products table');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('\n✅ Database updated for multiple product images!');
        console.log('Run: node server.js');
    }
});
