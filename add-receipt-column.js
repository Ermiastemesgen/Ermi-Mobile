const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('emobile.db');

console.log('Adding payment_receipt column to orders table...');

db.run(`ALTER TABLE orders ADD COLUMN payment_receipt TEXT`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('✅ payment_receipt column already exists');
        } else {
            console.error('❌ Error adding payment_receipt column:', err.message);
        }
    } else {
        console.log('✅ payment_receipt column added successfully!');
    }
    
    db.close();
});
