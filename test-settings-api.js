// Test script to verify settings API is working
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🧪 Testing Settings API');
console.log('📍 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to database');
        testSettings();
    }
});

function testSettings() {
    console.log('\n📋 Testing settings retrieval...');
    
    db.all('SELECT * FROM settings', [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching settings:', err.message);
        } else {
            console.log(`\n✅ Found ${rows.length} settings in database:`);
            
            const settings = {};
            rows.forEach(row => {
                settings[row.key] = row.value;
                const displayValue = row.value.length > 60 
                    ? row.value.substring(0, 60) + '...' 
                    : row.value;
                console.log(`  ${row.key}: ${displayValue}`);
            });
            
            // Test specific settings
            console.log('\n🔍 Key settings check:');
            console.log('  about_text exists:', !!settings.about_text);
            console.log('  site_name exists:', !!settings.site_name);
            console.log('  hero_title exists:', !!settings.hero_title);
            
            if (settings.about_text) {
                console.log('\n📝 Full about_text content:');
                console.log(settings.about_text);
            }
            
            // Simulate API response
            console.log('\n🌐 Simulated API response:');
            console.log(JSON.stringify({ settings }, null, 2));
        }
        
        db.close();
        console.log('\n🔄 Test completed');
    });
}