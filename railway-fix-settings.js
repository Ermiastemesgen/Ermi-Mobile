// Railway Settings Fix Script
// Run this once on Railway to ensure all settings are properly initialized

const sqlite3 = require('sqlite3').verbose();

// Use Railway's database path
const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🚀 Railway Settings Fix Script');
console.log('📍 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to Railway database');
        initializeAllSettings();
    }
});

function initializeAllSettings() {
    console.log('🔧 Initializing all required settings...');
    
    const requiredSettings = [
        { key: 'about_text', value: 'Welcome to Ermi Mobile, your one-stop destination for premium mobile accessories. We pride ourselves on offering high-quality products at competitive prices. From the latest wireless earbuds to durable phone cases and fast chargers, we have everything you need to enhance your mobile experience. Our commitment to customer satisfaction and product excellence has made us a trusted name in mobile accessories. Shop with confidence and discover the perfect accessories for your devices today!' },
        { key: 'hero_title', value: 'Ermi Mobile Accessories' },
        { key: 'hero_subtitle', value: 'Best And Quality Mobile Accessories' },
        { key: 'hero_button_text', value: 'Shop Now' },
        { key: 'site_name', value: 'Ermi Mobile' },
        { key: 'site_tagline', value: 'Your Mobile Accessories Store' },
        { key: 'primary_color', value: '#2563eb' },
        { key: 'text_color', value: '#1f2937' },
        { key: 'heading_color', value: '#1f2937' },
        { key: 'font_family', value: 'Roboto, sans-serif' },
        { key: 'heading_font', value: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
        { key: 'telebirr_name', value: 'Ermias Temesgen' },
        { key: 'telebirr_phone', value: '+251935303564' },
        { key: 'telebirr_instructions', value: 'ከከፈሉ በኋላ ደረሰኝ መላኮን እንዳይረሱ' },
        { key: 'cbe_name', value: 'Ermias Temesgen' },
        { key: 'cbe_account', value: '+251935303564' },
        { key: 'cbe_instructions', value: 'ከከፈሉ በኋላ ደረሰኝ መላኮን እንዳይረሱ' },
        { key: 'bank_name', value: 'Commercial Bank of Ethiopia' },
        { key: 'bank_account_name', value: 'Ermias Temesgen' },
        { key: 'bank_account_number', value: '1000297017873' },
        { key: 'bank_instructions', value: 'ከከፈሉ በኋላ ደረሰኝ መላኮን እንዳይረሱ' },
        { key: 'phone_number', value: '+251935303564' },
        { key: 'social_facebook', value: 'https://www.facebook.com/ermias.temsgen.75' },
        { key: 'social_instagram', value: 'https://www.instagram.com/ermi5.4' },
        { key: 'social_telegram', value: 'https://t.me/Ermi_12345' },
        { key: 'social_tiktok', value: 'https://www.tiktok.com/@ermi_2_' }
    ];

    let processed = 0;
    const total = requiredSettings.length;

    requiredSettings.forEach((setting, index) => {
        db.run(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [setting.key, setting.value],
            function(err) {
                processed++;
                
                if (err) {
                    console.error(`❌ Error setting ${setting.key}:`, err.message);
                } else {
                    console.log(`✅ ${setting.key}: ${setting.value.length > 50 ? setting.value.substring(0, 50) + '...' : setting.value}`);
                }

                // When all settings are processed
                if (processed === total) {
                    console.log(`\n🎉 All ${total} settings initialized successfully!`);
                    
                    // Verify about_text specifically
                    db.get('SELECT * FROM settings WHERE key = ?', ['about_text'], (err, row) => {
                        if (err) {
                            console.error('❌ Error verifying about_text:', err.message);
                        } else if (row) {
                            console.log('\n✅ About text verification:');
                            console.log('📝 Value:', row.value);
                            console.log('🕒 Updated:', row.updated_at);
                        } else {
                            console.log('\n❌ About text not found after initialization');
                        }
                        
                        db.close();
                        console.log('\n🔄 Database connection closed');
                        console.log('🌐 Your Railway website should now display the correct About Us text!');
                        console.log('💡 If the issue persists, try restarting your Railway service');
                    });
                }
            }
        );
    });
}