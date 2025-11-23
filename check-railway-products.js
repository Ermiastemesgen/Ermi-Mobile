// Check Railway database products status
const sqlite3 = require('sqlite3').verbose();

// Use Railway's database path
const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🔍 Checking Railway Products Database Status');
console.log('📍 Database path:', dbPath);
console.log('🌐 Environment:', process.env.NODE_ENV || 'development');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to Railway database');
        checkProductsStatus();
    }
});

function checkProductsStatus() {
    console.log('\n📦 PRODUCTS STATUS CHECK:');
    
    // Check if products table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'", [], (err, row) => {
        if (err) {
            console.error('❌ Error checking products table:', err.message);
            return;
        }
        
        if (!row) {
            console.log('❌ Products table does not exist!');
            console.log('💡 Database may not be properly initialized');
            db.close();
            return;
        }
        
        console.log('✅ Products table exists');
        
        // Count products
        db.get('SELECT COUNT(*) as count FROM products', [], (err, countRow) => {
            if (err) {
                console.error('❌ Error counting products:', err.message);
                return;
            }
            
            console.log(`📊 Total products in database: ${countRow.count}`);
            
            if (countRow.count === 0) {
                console.log('\n⚠️  NO PRODUCTS FOUND IN DATABASE');
                console.log('💡 This means:');
                console.log('   - Railway database is empty');
                console.log('   - Admin panel will show no products');
                console.log('   - Main page will show "Loading products..."');
                
                console.log('\n🔧 TO FIX:');
                console.log('   1. Add products via Railway admin panel');
                console.log('   2. Or run: node seed-database.js on Railway');
                console.log('   3. Or import existing products');
            } else {
                // Show some products
                console.log('\n📋 Sample products:');
                db.all('SELECT id, name, price FROM products LIMIT 5', [], (err, products) => {
                    if (err) {
                        console.error('❌ Error fetching products:', err.message);
                    } else {
                        products.forEach(product => {
                            console.log(`   ${product.id}: ${product.name} - ${product.price} Birr`);
                        });
                        
                        if (countRow.count > 5) {
                            console.log(`   ... and ${countRow.count - 5} more products`);
                        }
                    }
                    
                    checkAdminAccess();
                });
            }
        });
    });
}

function checkAdminAccess() {
    console.log('\n👤 ADMIN ACCESS CHECK:');
    
    // Check admin users
    db.all("SELECT name, email, role FROM users WHERE role = 'admin'", [], (err, admins) => {
        if (err) {
            console.error('❌ Error checking admin users:', err.message);
        } else if (admins.length === 0) {
            console.log('❌ No admin users found!');
            console.log('💡 You need admin access to manage products');
        } else {
            console.log('✅ Admin users found:');
            admins.forEach(admin => {
                console.log(`   ${admin.name} (${admin.email})`);
            });
        }
        
        checkSettings();
    });
}

function checkSettings() {
    console.log('\n⚙️  SETTINGS CHECK:');
    
    // Check auto-products disabled flag
    db.get("SELECT * FROM settings WHERE key = 'auto_products_disabled'", [], (err, setting) => {
        if (err) {
            console.error('❌ Error checking settings:', err.message);
        } else if (setting) {
            console.log(`✅ Auto-products disabled: ${setting.value}`);
        } else {
            console.log('⚠️  Auto-products disable flag not found');
        }
        
        showSummary();
    });
}

function showSummary() {
    console.log('\n📋 RAILWAY DATABASE SUMMARY:');
    console.log('================================');
    
    db.get('SELECT COUNT(*) as products FROM products', [], (err, pCount) => {
        db.get('SELECT COUNT(*) as users FROM users', [], (err2, uCount) => {
            db.get('SELECT COUNT(*) as settings FROM settings', [], (err3, sCount) => {
                
                console.log(`📦 Products: ${pCount ? pCount.products : 'Error'}`);
                console.log(`👤 Users: ${uCount ? uCount.users : 'Error'}`);
                console.log(`⚙️  Settings: ${sCount ? sCount.settings : 'Error'}`);
                
                console.log('\n🌐 RAILWAY ADMIN PANEL ACCESS:');
                console.log('   URL: https://your-railway-app.railway.app/admin.html');
                console.log('   Login: Use admin credentials');
                
                console.log('\n💡 NEXT STEPS:');
                if (pCount && pCount.products === 0) {
                    console.log('   1. ⚠️  Add products via admin panel');
                    console.log('   2. Or run seed script on Railway');
                } else {
                    console.log('   1. ✅ Products exist - admin panel should work');
                    console.log('   2. ✅ Check admin panel for product management');
                }
                
                db.close();
                console.log('\n🔄 Database check complete');
            });
        });
    });
}