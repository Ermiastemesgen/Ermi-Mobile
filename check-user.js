const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./emobile.db');

db.all('SELECT id, name, email, role FROM users WHERE email = ?', ['ermias616@gmail.com'], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.table(rows);
        if (rows.length > 0) {
            console.log('\n✅ User exists!');
        } else {
            console.log('\n❌ User not found');
        }
    }
    db.close();
});
