const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

console.log('📍 Adding Location Map URL Setting\n');

// Check if location_map_url already exists
db.get('SELECT * FROM settings WHERE key = ?', ['location_map_url'], (err, row) => {
    if (err) {
        console.error('❌ Error checking setting:', err.message);
        db.close();
        return;
    }

    if (row) {
        console.log('✅ Location map URL already exists:');
        console.log(`   ${row.value}\n`);
        console.log('💡 To update it, edit in admin panel or run:');
        console.log('   UPDATE settings SET value = "your_url" WHERE key = "location_map_url"');
        db.close();
    } else {
        console.log('📝 Adding location_map_url setting...\n');
        
        const defaultUrl = 'https://maps.google.com/?q=Addis+Ababa,+Ethiopia';
        
        db.run(
            'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            ['location_map_url', defaultUrl],
            function(err) {
                if (err) {
                    console.error('❌ Error adding setting:', err.message);
                } else {
                    console.log('✅ Location map URL added successfully!\n');
                    console.log(`   Default URL: ${defaultUrl}\n`);
                    console.log('📝 Next steps:');
                    console.log('   1. Go to admin panel settings');
                    console.log('   2. Update location_map_url with your Google Maps link');
                    console.log('   3. The location icon will link to your map!\n');
                }
                db.close();
            }
        );
    }
});
