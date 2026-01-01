// ===== FIX RENDER IMAGES - IMMEDIATE SOLUTION =====
// This script helps you understand and fix the image issue on Render

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🚨 RENDER IMAGE FIX DIAGNOSTIC\n');

// ===== Check Current Status =====
const dbPath = process.env.DATABASE_PATH || './emobile.db';

if (!fs.existsSync(dbPath)) {
    console.log('❌ Database not found!');
    process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Database connected');
    
    // Check products with images
    db.all('SELECT id, name, image FROM products WHERE image IS NOT NULL AND image != ""', [], (err, products) => {
        if (err) {
            console.error('❌ Error querying products:', err.message);
            db.close();
            return;
        }
        
        console.log(`📦 Found ${products.length} products with images\n`);
        
        if (products.length === 0) {
            console.log('ℹ️  No products with images found');
            db.close();
            return;
        }
        
        let cloudinaryCount = 0;
        let localCount = 0;
        let brokenCount = 0;
        
        console.log('📋 CURRENT IMAGE STATUS:');
        console.log('=' .repeat(50));
        
        products.forEach((product, index) => {
            if (product.image.startsWith('https://res.cloudinary.com')) {
                cloudinaryCount++;
                console.log(`${index + 1}. ✅ ${product.name}`);
                console.log(`   Status: SAFE (Cloudinary)`);
                console.log(`   URL: ${product.image.substring(0, 60)}...`);
            } else if (product.image.startsWith('/uploads/') || product.image.startsWith('uploads/')) {
                localCount++;
                const localPath = path.join(__dirname, product.image);
                const exists = fs.existsSync(localPath);
                console.log(`${index + 1}. ❌ ${product.name}`);
                console.log(`   Status: WILL DISAPPEAR ON DEPLOY (Local)`);
                console.log(`   File: ${exists ? 'EXISTS locally' : 'MISSING locally'}`);
                console.log(`   Path: ${product.image}`);
                if (!exists) brokenCount++;
            } else {
                brokenCount++;
                console.log(`${index + 1}. ❓ ${product.name}`);
                console.log(`   Status: UNKNOWN`);
                console.log(`   Path: ${product.image}`);
            }
            console.log('');
        });
        
        console.log('📊 SUMMARY:');
        console.log('=' .repeat(30));
        console.log(`✅ Safe (Cloudinary): ${cloudinaryCount}`);
        console.log(`❌ Will disappear: ${localCount}`);
        console.log(`❓ Unknown/Broken: ${brokenCount}`);
        console.log('');
        
        // Provide solutions
        console.log('🔧 SOLUTIONS:');
        console.log('=' .repeat(30));
        
        if (localCount > 0) {
            console.log('🚨 URGENT: You have images that will disappear on deployment!');
            console.log('');
            console.log('💡 SOLUTION OPTIONS:');
            console.log('');
            console.log('Option 1: Re-upload via Admin Panel (RECOMMENDED)');
            console.log('  1. Go to your deployed admin panel');
            console.log('  2. Edit each product and re-upload the image');
            console.log('  3. New images will automatically use Cloudinary');
            console.log('');
            console.log('Option 2: Fix Local Environment');
            console.log('  1. Update your local .env file with real Cloudinary credentials');
            console.log('  2. Run: node migrate-images-to-cloudinary.js migrate');
            console.log('  3. Push changes to trigger deployment');
            console.log('');
        }
        
        if (cloudinaryCount === products.length) {
            console.log('🎉 PERFECT! All images are using Cloudinary.');
            console.log('✅ Your images are safe and will persist across deployments.');
        }
        
        console.log('🔗 HELPFUL LINKS:');
        console.log('  • Test page: https://your-site.onrender.com/test-render-cloudinary.html');
        console.log('  • Admin panel: https://your-site.onrender.com/admin.html');
        console.log('  • Cloudinary dashboard: https://cloudinary.com/console');
        console.log('');
        
        console.log('📞 NEXT STEPS:');
        if (localCount > 0) {
            console.log('1. Go to your deployed admin panel');
            console.log('2. Re-upload the images for these products:');
            products.filter(p => p.image.includes('uploads/')).forEach(p => {
                console.log(`   • ${p.name}`);
            });
            console.log('3. Verify images use Cloudinary URLs');
            console.log('4. Test deployment - images should persist');
        } else {
            console.log('✅ All images are safe! No action needed.');
        }
        
        db.close();
    });
});

// ===== Check Cloudinary Configuration =====
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('🔍 LOCAL CLOUDINARY CONFIG:');
console.log(`Cloud Name: ${cloudName && !cloudName.includes('PUT_YOUR') ? '✅ Set' : '❌ Placeholder'}`);
console.log(`API Key: ${apiKey && !apiKey.includes('PUT_YOUR') ? '✅ Set' : '❌ Placeholder'}`);
console.log(`API Secret: ${apiSecret && !apiSecret.includes('PUT_YOUR') ? '✅ Set' : '❌ Placeholder'}`);
console.log('');