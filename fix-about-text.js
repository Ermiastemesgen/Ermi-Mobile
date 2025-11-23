const sqlite3 = require('sqlite3').verbose();

// Use the same database path as the server
const dbPath = process.env.DATABASE_PATH || './emobile.db';

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to database');
        fixAboutText();
    }
});

function fixAboutText() {
    // First check if about_text exists
    db.get('SELECT * FROM settings WHERE key = ?', ['about_text'], (err, row) => {
        if (err) {
            console.error('❌ Error checking about_text:', err.message);
            db.close();
            return;
        }

        const aboutText = 'Welcome to Ermi Mobile, your one-stop destination for premium mobile accessories. We pride ourselves on offering high-quality products at competitive prices. From the latest wireless earbuds to durable phone cases and fast chargers, we have everything you need to enhance your mobile experience. Our commitment to customer satisfaction and product excellence has made us a trusted name in mobile accessories. Shop with confidence and discover the perfect accessories for your devices today!';

        if (!row) {
            // Insert new about_text
            db.run(
                'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
                ['about_text', aboutText],
                function(err) {
                    if (err) {
                        console.error('❌ Error inserting about_text:', err.message);
                    } else {
                        console.log('✅ About text inserted successfully');
                    }
                    checkAllSettings();
                }
            );
        } else {
            // Update existing about_text
            db.run(
                'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
                [aboutText, 'about_text'],
                function(err) {
                    if (err) {
                        console.error('❌ Error updating about_text:', err.message);
                    } else {
                        console.log('✅ About text updated successfully');
                        console.log('📝 New about text:', aboutText);
                    }
                    checkAllSettings();
                }
            );
        }
    });
}

function checkAllSettings() {
    console.log('\n📋 Checking all settings...');
    db.all('SELECT * FROM settings ORDER BY key', [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching settings:', err.message);
        } else {
            console.log(`\n✅ Found ${rows.length} settings:`);
            rows.forEach(setting => {
                const value = setting.value.length > 50 
                    ? setting.value.substring(0, 50) + '...' 
                    : setting.value;
                console.log(`  ${setting.key}: ${value}`);
            });
            
            // Check specifically for about_text
            const aboutSetting = rows.find(s => s.key === 'about_text');
            if (aboutSetting) {
                console.log('\n✅ About text is properly set in database');
                console.log('📝 Full about text:', aboutSetting.value);
            } else {
                console.log('\n❌ About text is still missing from database');
            }
        }
        
        db.close();
        console.log('\n🔄 Database connection closed');
        console.log('💡 Try refreshing your Railway website now');
    });
}