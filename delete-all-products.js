// Script to delete all products from Render database
// Run this ONLY on Render to clear sample products

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the same database path as server.js
const dbPath = process.env.DATABASE_PATH || './emobile.db';
const db = new sqlite3.Database(dbPath);

console.log('🗑️  Starting product deletion...');
console.log('📍 Database:', dbPath);

// Delete all product images first (foreign key constraint)
db.run('DELETE FROM product_images', (err) => {
    if (err) {
        console.error('❌ Error deleting product images:', err.message);
    } else {
        console.log('✅ Deleted all product images');
    }
    
    // Then delete all products
    db.run('DELETE FROM products', function(err) {
        if (err) {
            console.error('❌ Error deleting products:', err.message);
        } else {
            console.log(`✅ Deleted ${this.changes} products`);
            console.log('🎉 All products deleted successfully!');
        }
        
        // Close database
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
            process.exit(0);
        });
    });
});
