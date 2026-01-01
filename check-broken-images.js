const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
});

console.log('🔍 Checking Product Images\n');
console.log('=========================================\n');

db.all('SELECT * FROM products ORDER BY id', [], (err, products) => {
    if (err) {
        console.error('❌ Error:', err.message);
        db.close();
        return;
    }

    let localImages = [];
    let cloudinaryImages = [];
    let missingFiles = [];

    products.forEach(product => {
        const isLocal = product.image && product.image.startsWith('uploads/');
        const isCloudinary = product.image && product.image.includes('cloudinary.com');

        if (isLocal) {
            const imagePath = path.join(__dirname, product.image);
            const exists = fs.existsSync(imagePath);
            
            localImages.push({
                name: product.name,
                path: product.image,
                exists: exists
            });

            if (!exists) {
                missingFiles.push(product);
            }
        } else if (isCloudinary) {
            cloudinaryImages.push(product);
        }
    });

    console.log('📊 Image Status Summary:\n');
    console.log(`Total Products: ${products.length}`);
    console.log(`✅ Cloudinary Images: ${cloudinaryImages.length}`);
    console.log(`⚠️  Local Images: ${localImages.length}`);
    console.log(`❌ Missing Files: ${missingFiles.length}\n`);

    if (localImages.length > 0) {
        console.log('=========================================');
        console.log('⚠️  Products with Local Images:');
        console.log('=========================================\n');
        
        localImages.forEach((img, i) => {
            console.log(`${i + 1}. ${img.name}`);
            console.log(`   Path: ${img.path}`);
            console.log(`   File exists: ${img.exists ? '✅ Yes' : '❌ No'}`);
            
            if (img.exists) {
                const fullPath = path.join(__dirname, img.path);
                console.log(`   Location: ${fullPath}`);
            }
            console.log();
        });

        console.log('=========================================');
        console.log('🔧 How to Fix:');
        console.log('=========================================\n');
        console.log('Option 1: Upload via Render Admin (Easiest)');
        console.log('  1. Go to your Render admin panel');
        console.log('  2. Edit each product above');
        console.log('  3. Upload the image file');
        console.log('  4. Save\n');
        
        console.log('Option 2: Upload to Cloudinary First');
        console.log('  1. Set up Cloudinary credentials in .env');
        console.log('  2. Run: node upload-images-to-cloudinary.js');
        console.log('  3. Re-import to Render\n');
    }

    if (cloudinaryImages.length > 0) {
        console.log('=========================================');
        console.log('✅ Products with Cloudinary Images:');
        console.log('=========================================\n');
        
        cloudinaryImages.forEach((product, i) => {
            console.log(`${i + 1}. ${product.name}`);
            console.log(`   URL: ${product.image.substring(0, 60)}...`);
            console.log();
        });
    }

    db.close();
});
