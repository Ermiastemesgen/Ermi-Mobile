// Complete fix for Railway database issues
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('🔧 RAILWAY COMPLETE DATABASE FIX');
console.log('=================================');

// Check environment
const dbPath = process.env.DATABASE_PATH || './emobile.db';
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;

console.log('🌐 Environment:', isRailway ? 'Railway' : 'Local');
console.log('📍 Database path:', dbPath);
console.log('📁 Database exists:', fs.existsSync(dbPath));

// Check if using persistent storage
const isPersistent = dbPath.includes('/data/');
console.log('💾 Using persistent storage:', isPersistent);

if (!isPersistent && isRailway) {
    console.log('\n⚠️  WARNING: Not using persistent storage!');
    console.log('💡 Database will reset on each deployment');
    console.log('🔧 Fix: Set DATABASE_PATH=/data/emobile.db in Railway');
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to database');
        performCompleteFix();
    }
});

function performCompleteFix() {
    console.log('\n🔧 Performing complete fix...');
    
    // Step 1: Add disable flags
    const disableSettings = [
        ['auto_products_disabled', 'true'],
        ['auto_seeding_disabled', 'true'],
        ['sample_products_disabled', 'true'],
        ['railway_fix_applied', new Date().toISOString()]
    ];
    
    let settingsAdded = 0;
    disableSettings.forEach(([key, value]) => {
        db.run(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [key, value],
            function(err) {
                settingsAdded++;
                if (err) {
                    console.error(`❌ Error setting ${key}:`, err.message);
                } else {
                    console.log(`✅ ${key}: ${value}`);
                }
                
                if (settingsAdded === disableSettings.length) {
                    checkCurrentState();
                }
            }
        );
    });
}

function checkCurrentState() {
    console.log('\n📊 Current Database State:');
    
    // Count products
    db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (err) {
            console.error('❌ Error counting products:', err.message);
        } else {
            console.log(`📦 Products: ${row.count}`);
            
            if (row.count > 0) {
                // Show recent products
                db.all('SELECT id, name, price FROM products ORDER BY id DESC LIMIT 3', [], (err, products) => {
                    if (!err && products.length > 0) {
                        console.log('📋 Recent products:');
                        products.forEach(p => {
                            console.log(`   ${p.id}: ${p.name} - ${p.price} Birr`);
                        });
                    }
                    checkUsers();
                });
            } else {
                console.log('📦 No products found (database is clean)');
                checkUsers();
            }
        }
    });
}

function checkUsers() {
    // Count users
    db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
        if (err) {
            console.error('❌ Error counting users:', err.message);
        } else {
            console.log(`👤 Users: ${row.count}`);
        }
        
        // Count settings
        db.get('SELECT COUNT(*) as count FROM settings', [], (err, row) => {
            if (err) {
                console.error('❌ Error counting settings:', err.message);
            } else {
                console.log(`⚙️  Settings: ${row.count}`);
            }
            
            showFinalStatus();
        });
    });
}

function showFinalStatus() {
    console.log('\n🎉 RAILWAY FIX COMPLETE!');
    console.log('========================');
    
    console.log('✅ Auto-product seeding DISABLED');
    console.log('✅ Sample product creation DISABLED');
    console.log('✅ Database protection flags ADDED');
    
    if (isPersistent) {
        console.log('✅ Using persistent storage - data will survive deployments');
    } else {
        console.log('⚠️  Using ephemeral storage - data will reset on deployment');
        console.log('💡 To fix: Add DATABASE_PATH=/data/emobile.db in Railway');
    }
    
    console.log('\n📋 What happens now:');
    console.log('   - No automatic products will be added');
    console.log('   - Database will stay clean on deployment');
    console.log('   - You control all product additions');
    
    console.log('\n🔧 To add products:');
    console.log('   - Use admin panel: /admin.html');
    console.log('   - Or run manual scripts when needed');
    
    db.close();
    console.log('\n🔄 Fix complete - database closed');
}