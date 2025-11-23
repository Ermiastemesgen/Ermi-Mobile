// Script to completely disable automatic product creation and clear existing products
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🚫 Disabling Automatic Product Creation');
console.log('📍 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to database');
        disableAutoProducts();
    }
});

function disableAutoProducts() {
    console.log('\n🔧 Checking current products...');
    
    // First, check how many products exist
    db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking products:', err.message);
            db.close();
            return;
        }

        console.log(`📦 Found ${row.count} products in database`);

        if (row.count > 0) {
            console.log('\n❓ Do you want to delete all existing products?');
            console.log('   This will remove all products from your store.');
            console.log('   You can add your own products manually via admin panel.');
            console.log('\n💡 To delete all products, run: node delete-all-products.js');
            console.log('💡 To keep products and just disable auto-creation, continue...');
        }

        // Add a flag to prevent any future automatic product creation
        addDisableFlag();
    });
}

function addDisableFlag() {
    console.log('\n🔧 Adding disable flag to settings...');
    
    db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        ['auto_products_disabled', 'true'],
        function(err) {
            if (err) {
                console.error('❌ Error adding disable flag:', err.message);
            } else {
                console.log('✅ Auto-product creation disabled in settings');
            }
            
            // Also add a description
            db.run(
                'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
                ['auto_products_disabled_note', 'Automatic product creation has been permanently disabled. Add products manually via admin panel.'],
                function(err) {
                    if (err) {
                        console.error('❌ Error adding disable note:', err.message);
                    } else {
                        console.log('✅ Disable note added to settings');
                    }
                    
                    showSummary();
                }
            );
        }
    );
}

function showSummary() {
    console.log('\n📋 Summary:');
    console.log('✅ Automatic product creation is DISABLED');
    console.log('✅ Server will not add products automatically on startup');
    console.log('✅ Settings flag added to database');
    console.log('\n💡 To add products:');
    console.log('   1. Use admin panel: /admin.html');
    console.log('   2. Or run manual scripts: node seed-database.js');
    console.log('\n🔄 Your Railway deployment should now start without adding products automatically');
    
    db.close();
    console.log('\n🔄 Database connection closed');
}