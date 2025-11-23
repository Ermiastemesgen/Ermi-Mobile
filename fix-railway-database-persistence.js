// Fix Railway database persistence issues
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🔧 Railway Database Persistence Fix');
console.log('===================================');

// Check current database location
const currentDbPath = process.env.DATABASE_PATH || './emobile.db';
console.log('📍 Current database path:', currentDbPath);

// Railway persistent storage path
const persistentDbPath = '/data/emobile.db';
console.log('📍 Persistent database path:', persistentDbPath);

// Check if /data directory exists (Railway persistent storage)
const dataDir = '/data';
const hasDataDir = fs.existsSync(dataDir);
console.log('📁 /data directory exists:', hasDataDir);

if (hasDataDir) {
    console.log('✅ Railway persistent storage is available');
    fixDatabasePath();
} else {
    console.log('⚠️  Railway persistent storage not configured');
    console.log('💡 Database will reset on each deployment');
    showPersistentStorageSetup();
}

function fixDatabasePath() {
    console.log('\n🔧 Fixing database path for persistence...');
    
    // Check if persistent database exists
    const persistentDbExists = fs.existsSync(persistentDbPath);
    console.log('📄 Persistent database exists:', persistentDbExists);
    
    // Check if current database exists
    const currentDbExists = fs.existsSync(currentDbPath);
    console.log('📄 Current database exists:', currentDbExists);
    
    if (currentDbExists && !persistentDbExists) {
        console.log('📋 Copying current database to persistent storage...');
        try {
            fs.copyFileSync(currentDbPath, persistentDbPath);
            console.log('✅ Database copied to persistent storage');
        } catch (error) {
            console.error('❌ Error copying database:', error.message);
        }
    }
    
    // Test persistent database
    testPersistentDatabase();
}

function testPersistentDatabase() {
    console.log('\n🧪 Testing persistent database...');
    
    const db = new sqlite3.Database(persistentDbPath, (err) => {
        if (err) {
            console.error('❌ Error opening persistent database:', err.message);
            return;
        }
        
        console.log('✅ Connected to persistent database');
        
        // Check products count
        db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
            if (err) {
                console.error('❌ Error checking products:', err.message);
            } else {
                console.log(`📦 Products in persistent database: ${row.count}`);
            }
            
            // Check users count
            db.get('SELECT COUNT(*) as count FROM users', [], (err, userRow) => {
                if (err) {
                    console.error('❌ Error checking users:', err.message);
                } else {
                    console.log(`👤 Users in persistent database: ${userRow.count}`);
                }
                
                db.close();
                showEnvironmentFix();
            });
        });
    });
}

function showEnvironmentFix() {
    console.log('\n🔧 ENVIRONMENT VARIABLE FIX:');
    console.log('=============================');
    
    console.log('Add this environment variable in Railway:');
    console.log('Key: DATABASE_PATH');
    console.log('Value: /data/emobile.db');
    
    console.log('\n📋 Steps to fix in Railway:');
    console.log('1. Go to Railway dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Variables tab');
    console.log('4. Add: DATABASE_PATH = /data/emobile.db');
    console.log('5. Redeploy your application');
    
    console.log('\n✅ This will ensure:');
    console.log('   - Database persists between deployments');
    console.log('   - Products you add stay saved');
    console.log('   - No automatic sample products');
}

function showPersistentStorageSetup() {
    console.log('\n🔧 RAILWAY PERSISTENT STORAGE SETUP:');
    console.log('====================================');
    
    console.log('Your Railway project needs persistent storage:');
    console.log('\n1. Go to Railway dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings');
    console.log('4. Enable "Persistent Storage"');
    console.log('5. Mount path: /data');
    console.log('6. Add environment variable:');
    console.log('   DATABASE_PATH=/data/emobile.db');
    
    console.log('\n⚠️  WITHOUT persistent storage:');
    console.log('   - Database resets on every deployment');
    console.log('   - Products disappear when you redeploy');
    console.log('   - Settings are lost');
    
    console.log('\n✅ WITH persistent storage:');
    console.log('   - Database survives deployments');
    console.log('   - Products stay saved');
    console.log('   - Settings persist');
}