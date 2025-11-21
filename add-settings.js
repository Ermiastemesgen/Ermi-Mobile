const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to database\n');
        
        // Create settings table
        db.run(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating settings table:', err.message);
            } else {
                console.log('✅ Settings table created');
                
                // Insert default settings
                const defaultSettings = [
                    { key: 'hero_title', value: 'Quality Mobile Accessories' },
                    { key: 'hero_subtitle', value: 'Best prices on chargers, headphones, cases, and more.' },
                    { key: 'hero_button_text', value: 'Shop Now' },
                    { key: 'hero_background_image', value: '' },
                    { key: 'site_name', value: 'E Mobile' },
                    { key: 'site_tagline', value: 'Your Mobile Accessories Store' },
                    { key: 'font_family', value: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
                    { key: 'heading_font', value: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
                    { key: 'about_text', value: 'Welcome to E Mobile, your one-stop destination for premium mobile accessories. We pride ourselves on offering high-quality products at competitive prices. From the latest wireless earbuds to durable phone cases and fast chargers, we have everything you need to enhance your mobile experience. Our commitment to customer satisfaction and product excellence has made us a trusted name in mobile accessories. Shop with confidence and discover the perfect accessories for your devices today!' },
                    { key: 'primary_color', value: '#2563eb' },
                    { key: 'text_color', value: '#1f2937' },
                    { key: 'heading_color', value: '#1f2937' },
                    { key: 'social_facebook', value: '#' },
                    { key: 'social_instagram', value: '#' },
                    { key: 'social_tiktok', value: '#' },
                    { key: 'social_telegram', value: '#' }
                ];
                
                const stmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
                defaultSettings.forEach(setting => {
                    stmt.run(setting.key, setting.value);
                });
                stmt.finalize(() => {
                    console.log('✅ Default settings inserted\n');
                    
                    // Show settings
                    db.all('SELECT * FROM settings', [], (err, rows) => {
                        console.log('📋 Current Settings:');
                        rows.forEach(setting => {
                            console.log(`  ${setting.key}: ${setting.value}`);
                        });
                        db.close();
                    });
                });
            }
        });
    }
});
