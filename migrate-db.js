const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to database');
        
        // Add image column to products table
        db.run('ALTER TABLE products ADD COLUMN image TEXT', (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log('✅ Image column already exists');
                } else {
                    console.error('❌ Error adding image column:', err.message);
                }
            } else {
                console.log('✅ Image column added successfully');
            }
            
            // Verify the change
            db.all('PRAGMA table_info(products)', [], (err, rows) => {
                if (err) {
                    console.error('Error:', err.message);
                } else {
                    console.log('\n📋 Products table structure:');
                    rows.forEach(row => {
                        console.log(`  - ${row.name} (${row.type})`);
                    });
                }
                db.close();
            });
        });
    }
});
