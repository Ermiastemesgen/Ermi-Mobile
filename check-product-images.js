const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
});

console.log('🖼️  Checking Product Images\n');

db.all('SELECT * FROM product_images ORDER BY product_id, display_order', [], (err, images) => {
    if (err) {
        console.log('⚠️  No product_images table found');
        db.close();
        return;
    }

    console.log(`✅ Found ${images.length} product images\n`);
    
    if (images.length > 0) {
        images.forEach((img, i) => {
            console.log(`${i + 1}. Product ID: ${img.product_id}, Order: ${img.display_order}`);
            console.log(`   URL: ${img.image_url}\n`);
        });
    }
    
    db.close();
});
