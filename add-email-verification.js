const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./emobile.db');

console.log('Adding email verification fields to users table...');

db.serialize(() => {
    // Add email verification columns
    db.run(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding email_verified:', err.message);
        } else {
            console.log('✅ Added email_verified column');
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN verification_token TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding verification_token:', err.message);
        } else {
            console.log('✅ Added verification_token column');
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN verification_token_expires DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding verification_token_expires:', err.message);
        } else {
            console.log('✅ Added verification_token_expires column');
        }
    });

    // Verify existing users (so they can still log in)
    db.run(`UPDATE users SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0`, function(err) {
        if (err) {
            console.error('Error updating existing users:', err.message);
        } else {
            console.log(`✅ Verified ${this.changes} existing users`);
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('\n✅ Email verification setup complete!');
        console.log('Run: node server.js');
    }
});
