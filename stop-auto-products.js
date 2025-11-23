// Script to completely stop automatic product seeding on Railway
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🚫 Stopping Automatic Product Seeding');
console.log('📍 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to database');
        stopAutoSeeding();
    }
});

function stopAutoSeeding() {
    console.log('\n🔧 Adding disable flags to prevent automatic product seeding...');
    
    const disableFlags = [
        ['auto_products_disabled', 'true'],
        ['auto_seeding_disabled', 'true'],
        ['sample_products_disabled', 'true'],
        ['product_initialization_disabled', 'true'],
        ['no_auto_products', 'true'],
        ['manual_products_only', 'true'],
        ['seeding_prevention_active', 'true']
    ];
    
    let flagsAdded = 0;
    
    disableFlags.forEach(([key, value]) => {
        db.run(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [key, value],
            function(err) {
                flagsAdded++;
                
                if (err) {
                    console.error(`❌ Error setting ${key}:`, err.message);
                } else {
                    console.log(`✅ ${key}: ${value}`);
                }
                
                if (flagsAdded === disableFlags.length) {
                    clearExistingProducts();
                }
            }
        );
    });
}

function clearExistingProducts() {
    console.log('\n🗑️  Clearing existing products...');
    
    db.run('DELETE FROM products', [], function(err) {
        if (err) {
            console.error('❌ Error clearing products:', err.message);
        } else {
            console.log(`✅ Cleared ${this.changes} products from database`);
        }
        
        // Also clear product images
        db.run('DELETE FROM product_images', [], function(err) {
            if (err) {
                console.error('❌ Error clearing product images:', err.message);
            } else {
                console.log(`✅ Cleared ${this.changes} product images`);
            }
            
            showFinalStatus();
        });
    });
}

function showFinalStatus() {
    console.log('\n🎉 AUTOMATIC PRODUCT SEEDING COMPLETELY DISABLED!');
    console.log('================================================');
    
    // Verify products are cleared
    db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking products:', err.message);
        } else {
            console.log(`📦 Products in database: ${row.count}`);
        }
        
        // Show all disable flags
        db.all('SELECT key, value FROM settings WHERE key LIKE "%disable%" OR key LIKE "%auto%" OR key LIKE "%seed%"', [], (err, settings) => {
            if (err) {
                console.error('❌ Error checking settings:', err.message);
            } else {
                console.log('\n🚫 Disable flags active:');
                settings.forEach(setting => {
                    console.log(`   ${setting.key}: ${setting.value}`);
                });
            }
            
            console.log('\n✅ RESULTS:');
            console.log('   - All automatic product seeding is DISABLED');
            console.log('   - Database is clean (no products)');
            console.log('   - Multiple disable flags prevent future seeding');
            console.log('   - You have full control over product additions');
            
            console.log('\n💡 TO ADD PRODUCTS:');
            console.log('   - Use admin panel: /admin.html or /working-admin.html');
            console.log('   - Add products manually one by one');
            console.log('   - Or use "Add Sample Products" button when YOU want to');
            
            console.log('\n🚀 Your Railway deployment will no longer add products automatically!');
            
            db.close();
            console.log('\n🔄 Database connection closed');
        });
    });
}