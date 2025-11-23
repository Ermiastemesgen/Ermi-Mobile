// Quick one-liner fix for About Us text on Railway
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DATABASE_PATH || './emobile.db');

const aboutText = 'Welcome to Ermi Mobile, your one-stop destination for premium mobile accessories. We pride ourselves on offering high-quality products at competitive prices. From the latest wireless earbuds to durable phone cases and fast chargers, we have everything you need to enhance your mobile experience. Our commitment to customer satisfaction and product excellence has made us a trusted name in mobile accessories. Shop with confidence and discover the perfect accessories for your devices today!';

db.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['about_text', aboutText], function(err) {
    if (err) {
        console.error('❌ Error:', err.message);
    } else {
        console.log('✅ About text fixed! Refresh your Railway website.');
    }
    db.close();
});