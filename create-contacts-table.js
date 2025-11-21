const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('emobile.db');

console.log('Creating contacts table...');

db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('❌ Error creating contacts table:', err.message);
    } else {
        console.log('✅ Contacts table created successfully!');
    }
    
    db.close();
});
