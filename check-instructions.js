const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('emobile.db');

db.all('SELECT key, value FROM settings WHERE key LIKE "%instructions%"', (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Instruction settings:');
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
