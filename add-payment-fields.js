const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('emobile.db');

console.log('Adding payment fields to orders table...');

// Add payment_method column
db.run(`ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash'`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('✅ payment_method column already exists');
        } else {
            console.error('❌ Error adding payment_method column:', err.message);
        }
    } else {
        console.log('✅ payment_method column added successfully!');
    }
});

// Add delivery_address column
db.run(`ALTER TABLE orders ADD COLUMN delivery_address TEXT`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('✅ delivery_address column already exists');
        } else {
            console.error('❌ Error adding delivery_address column:', err.message);
        }
    } else {
        console.log('✅ delivery_address column added successfully!');
    }
});

// Add phone_number column
db.run(`ALTER TABLE orders ADD COLUMN phone_number TEXT`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('✅ phone_number column already exists');
        } else {
            console.error('❌ Error adding phone_number column:', err.message);
        }
    } else {
        console.log('✅ phone_number column added successfully!');
    }
    
    db.close();
});
