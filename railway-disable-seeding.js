// Railway script to permanently disable automatic product seeding
// Run this ONCE on Railway to stop all automatic product creation

const sqlite3 = require('sqlite3').verbose();

// Use Railway database path
const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🚫 RAILWAY: Disabling Automatic Product Seeding');
console.log('===============================================');
console.log('📍 Database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to Railway database');
        disableAllSeeding();
    }
});

function disableAllSeeding() {
    console.log('\n🔧 Adding comprehensive disable flags...');
    
    // Add multiple disable flags to ensure no automatic seeding
    const preventionFlags = [
        ['STOP_AUTO_PRODUCTS', 'TRUE'],
        ['DISABLE_PRODUCT_SEEDING', 'TRUE'], 
        ['NO_SAMPLE_PRODUCTS', 'TRUE'],
        ['MANUAL_PRODUCTS_ONLY', 'TRUE'],
        ['SEEDING_BLOCKED', 'TRUE'],
        ['AUTO_INIT_DISABLED', 'TRUE'],
        ['RAILWAY_SEEDING_OFF', 'TRUE'],
        ['PRODUCT_CREATION_MANUAL', 'TRUE']
    ];
    
    let added = 0;
    
    preventionFlags.forEach(([key, value]) => {
        db.run(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [key, value],
            function(err) {
                added++;
                
                if (err) {
                    console.error(`❌ Failed to add ${key}:`, err.message);
                } else {
                    console.log(`✅ Added: ${key} = ${value}`);
                }
                
                if (added === preventionFlags.length) {
                    removeUnwantedProducts();
                }
            }
        );
    });
}

function removeUnwantedProducts() {
    console.log('\n🗑️  Removing any unwanted automatic products...');
    
    // Check current products
    db.all('SELECT id, name FROM products', [], (err, products) => {
        if (err) {
            console.error('❌ Error checking products:', err.message);
            showSummary();
            return;
        }
        
        console.log(`📦 Found ${products.length} products in database`);
        
        if (products.length > 0) {
            console.log('📋 Current products:');
            products.forEach(product => {
                console.log(`   ${product.id}: ${product.name}`);
            });
            
            console.log('\n❓ These products will be REMOVED to ensure clean start');
            console.log('💡 You can add your own products manually via admin panel');
            
            // Clear all products
            db.run('DELETE FROM products', [], function(err) {
                if (err) {
                    console.error('❌ Error clearing products:', err.message);
                } else {
                    console.log(`✅ Removed ${this.changes} products`);
                }
                
                // Clear product images too
                db.run('DELETE FROM product_images', [], function(err) {
                    if (err) {
                        console.error('❌ Error clearing product images:', err.message);
                    } else {
                        console.log(`✅ Removed ${this.changes} product images`);
                    }
                    
                    showSummary();
                });
            });
        } else {
            console.log('✅ No products found - database is already clean');
            showSummary();
        }
    });
}

function showSummary() {
    console.log('\n🎉 AUTOMATIC PRODUCT SEEDING PERMANENTLY DISABLED!');
    console.log('==================================================');
    
    // Verify the disable flags
    db.all('SELECT key, value FROM settings WHERE key LIKE "%AUTO%" OR key LIKE "%SEED%" OR key LIKE "%PRODUCT%"', [], (err, flags) => {
        if (err) {
            console.error('❌ Error checking flags:', err.message);
        } else {
            console.log(`\n🚫 Active disable flags: ${flags.length}`);
            flags.forEach(flag => {
                console.log(`   ${flag.key}: ${flag.value}`);
            });
        }
        
        // Final product count
        db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
            if (err) {
                console.error('❌ Error checking final count:', err.message);
            } else {
                console.log(`\n📦 Final product count: ${row.count}`);
            }
            
            console.log('\n✅ WHAT HAPPENS NOW:');
            console.log('   - Railway will NOT add products automatically');
            console.log('   - Database starts clean on each deployment');
            console.log('   - You control ALL product additions');
            console.log('   - No more unwanted sample products');
            
            console.log('\n🔧 TO ADD PRODUCTS:');
            console.log('   - Use admin panel: /working-admin.html');
            console.log('   - Add products manually when YOU want them');
            console.log('   - Use "Add Sample Products" button if needed');
            
            console.log('\n🚀 Your Railway site is now under YOUR complete control!');
            
            db.close();
            console.log('\n🔄 Script completed successfully');
        });
    });
}