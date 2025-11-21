const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to database\n');
        
        // Add parent_id column to categories table
        db.run('ALTER TABLE categories ADD COLUMN parent_id INTEGER', (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log('✅ Parent_id column already exists');
                } else {
                    console.error('❌ Error adding parent_id column:', err.message);
                }
            } else {
                console.log('✅ Parent_id column added to categories');
            }
            
            // Show current categories
            db.all('SELECT * FROM categories ORDER BY id', [], (err, rows) => {
                console.log('\n📋 Current Categories:');
                rows.forEach(cat => {
                    console.log(`  ${cat.id}. ${cat.name} - ${cat.description}`);
                });
                
                console.log('\n✅ Hierarchy system ready!');
                console.log('You can now create parent-child category relationships.');
                console.log('\nExample structure:');
                console.log('  Electronics (parent)');
                console.log('    ├─ Audio (child)');
                console.log('    │   ├─ Headphones (grandchild)');
                console.log('    │   └─ Speakers (grandchild)');
                console.log('    └─ Accessories (child)');
                
                db.close();
            });
        });
    }
});
