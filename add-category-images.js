const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('emobile.db');

console.log('Adding image column to categories table...');

db.run(`ALTER TABLE categories ADD COLUMN image TEXT`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('✅ Image column already exists in categories table');
        } else {
            console.error('❌ Error adding image column:', err.message);
        }
    } else {
        console.log('✅ Image column added to categories table successfully!');
    }
    
    db.close();
});
