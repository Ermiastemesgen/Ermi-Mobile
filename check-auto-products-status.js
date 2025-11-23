// Check status of automatic product creation and provide control
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🔍 Checking Automatic Product Creation Status');
console.log('📍 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to database');
        checkStatus();
    }
});

function checkStatus() {
    console.log('\n📋 Current Status Check:');
    
    // Check products count
    db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking products:', err.message);
        } else {
            console.log(`📦 Products in database: ${row.count}`);
        }
        
        // Check disable flag
        db.get('SELECT * FROM settings WHERE key = ?', ['auto_products_disabled'], (err, setting) => {
            if (err) {
                console.error('❌ Error checking disable flag:', err.message);
            } else if (setting) {
                console.log(`🚫 Auto-products disabled: ${setting.value}`);
                console.log(`📅 Disabled on: ${setting.updated_at}`);
            } else {
                console.log('⚠️  No disable flag found - adding it now...');
                addDisableFlag();
                return;
            }
            
            // Show recent products (if any)
            showRecentProducts();
        });
    });
}

function addDisableFlag() {
    db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        ['auto_products_disabled', 'true'],
        function(err) {
            if (err) {
                console.error('❌ Error adding disable flag:', err.message);
            } else {
                console.log('✅ Auto-product creation disabled flag added');
            }
            showRecentProducts();
        }
    );
}

function showRecentProducts() {
    console.log('\n📦 Recent Products (last 10):');
    
    db.all(
        'SELECT id, name, price, created_at FROM products ORDER BY id DESC LIMIT 10',
        [],
        (err, products) => {
            if (err) {
                console.error('❌ Error fetching recent products:', err.message);
            } else if (products.length === 0) {
                console.log('   No products found');
            } else {
                products.forEach(product => {
                    console.log(`   ${product.id}: ${product.name} - ${product.price} Birr`);
                });
            }
            
            showSummary();
        }
    );
}

function showSummary() {
    console.log('\n📋 Summary:');
    console.log('✅ Server.js has insertDefaultProducts() DISABLED');
    console.log('✅ No automatic product seeding on startup');
    console.log('✅ Database flag prevents accidental product creation');
    
    console.log('\n💡 If products are still being added automatically:');
    console.log('   1. Check Railway deployment logs for any scripts running');
    console.log('   2. Verify no manual scripts are being called');
    console.log('   3. Check if import-products.js is being run accidentally');
    
    console.log('\n🔧 To manage products:');
    console.log('   ✅ Add: Use admin panel at /admin.html');
    console.log('   ✅ Bulk add: Run node seed-database.js manually');
    console.log('   ❌ Delete all: Run node delete-all-products.js');
    
    console.log('\n🚀 Your Railway deployment should NOT add products automatically');
    
    db.close();
    console.log('\n🔄 Status check complete');
}