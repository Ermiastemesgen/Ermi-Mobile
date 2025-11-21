const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        console.log('✅ Connected to database\n');
        
        // Check users
        db.all('SELECT * FROM users', [], (err, rows) => {
            console.log('=== USERS TABLE ===');
            if (err) {
                console.error('Error:', err.message);
            } else {
                console.log(`Total users: ${rows.length}`);
                rows.forEach(user => {
                    console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
                });
            }
            console.log('');
            
            // Check products
            db.all('SELECT * FROM products', [], (err, rows) => {
                console.log('=== PRODUCTS TABLE ===');
                if (err) {
                    console.error('Error:', err.message);
                } else {
                    console.log(`Total products: ${rows.length}`);
                    rows.forEach(product => {
                        console.log(`- ${product.name}: $${product.price}`);
                    });
                }
                console.log('');
                
                // Check orders
                db.all('SELECT * FROM orders', [], (err, rows) => {
                    console.log('=== ORDERS TABLE ===');
                    if (err) {
                        console.error('Error:', err.message);
                    } else {
                        console.log(`Total orders: ${rows.length}`);
                    }
                    
                    db.close();
                });
            });
        });
    }
});
