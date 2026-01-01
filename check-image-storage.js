// ===== CHECK IMAGE STORAGE STATUS =====
// This script checks your current image storage configuration

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Image Storage Configuration\n');

// ===== Check Environment Variables =====
console.log('📋 Environment Variables:');
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log(`CLOUDINARY_CLOUD_NAME: ${cloudName ? '✅ Set' : '❌ Missing'}`);
console.log(`CLOUDINARY_API_KEY: ${apiKey ? '✅ Set' : '❌ Missing'}`);
console.log(`CLOUDINARY_API_SECRET: ${apiSecret ? '✅ Set' : '❌ Missing'}`);

const useCloudinary = cloudName && apiKey && apiSecret;
console.log(`\n☁️  Cloudinary Status: ${useCloudinary ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}`);

if (!useCloudinary) {
    console.log('\n🚨 WARNING: Cloudinary not configured!');
    console.log('Your images will be stored locally and WILL BE LOST on deployment.');
    console.log('\nTo fix this:');
    console.log('1. Sign up at https://cloudinary.com');
    console.log('2. Get your credentials from the dashboard');
    console.log('3. Add them to your .env file or deployment environment');
}

// ===== Check Database =====
const dbPath = process.env.DATABASE_PATH || './emobile.db';
console.log(`\n📊 Database: ${dbPath}`);

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
        
        console.log(`\n📦 Products with Images: ${products.length}`);
        
        if (products.length === 0) {
            console.log('ℹ️  No products with images found');
            db.close();
            return;
        }
        
        let cloudinaryCount = 0;
        let localCount = 0;
        let brokenCount = 0;
        
        console.log('\n📋 Image Storage Analysis:');
        
        products.forEach((product, index) => {
            if (product.image.startsWith('https://res.cloudinary.com')) {
                cloudinaryCount++;
                console.log(`${index + 1}. ✅ ${product.name}: Cloudinary`);
            } else if (product.image.startsWith('/uploads/')) {
                localCount++;
                const localPath = path.join(__dirname, product.image);
                const exists = fs.existsSync(localPath);
                console.log(`${index + 1}. ${exists ? '📁' : '❌'} ${product.name}: Local ${exists ? '(exists)' : '(MISSING)'}`);
                if (!exists) brokenCount++;
            } else {
                console.log(`${index + 1}. ❓ ${product.name}: Unknown (${product.image})`);
            }
        });
        
        console.log('\n📊 Summary:');
        console.log(`✅ Cloudinary: ${cloudinaryCount}`);
        console.log(`📁 Local: ${localCount}`);
        console.log(`❌ Broken: ${brokenCount}`);
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        
        if (cloudinaryCount === products.length) {
            console.log('🎉 Perfect! All images are stored in Cloudinary.');
            console.log('✅ Your images will persist across deployments.');
        } else if (localCount > 0) {
            console.log('⚠️  You have local images that will be lost on deployment.');
            console.log('🔧 Solution: Set up Cloudinary and migrate images.');
            console.log('📝 Run: node migrate-images-to-cloudinary.js migrate');
        }
        
        if (brokenCount > 0) {
            console.log('🚨 You have broken image links!');
            console.log('🔧 Solution: Re-upload these images through the admin panel.');
        }
        
        // Check uploads directory
        const uploadsDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            console.log(`\n📁 Local uploads directory: ${files.length} files`);
            
            if (files.length > 0 && !useCloudinary) {
                console.log('⚠️  These files will be lost on deployment!');
            }
        } else {
            console.log('\n📁 No local uploads directory found');
        }
        
        db.close();
    });
});

// ===== Check Server Configuration =====
console.log('\n🔧 Server Configuration Check:');

try {
    const serverJs = fs.readFileSync('server.js', 'utf8');
    
    if (serverJs.includes('useCloudinary')) {
        console.log('✅ Server has Cloudinary configuration');
    } else {
        console.log('❌ Server missing Cloudinary configuration');
    }
    
    if (serverJs.includes('CloudinaryStorage')) {
        console.log('✅ Server has CloudinaryStorage setup');
    } else {
        console.log('❌ Server missing CloudinaryStorage setup');
    }
    
} catch (error) {
    console.log('❌ Could not read server.js file');
}

console.log('\n🎯 Next Steps:');
if (!useCloudinary) {
    console.log('1. Set up Cloudinary account: https://cloudinary.com');
    console.log('2. Add environment variables to your deployment');
    console.log('3. Redeploy your application');
    console.log('4. Run migration: node migrate-images-to-cloudinary.js migrate');
} else {
    console.log('1. Your Cloudinary is configured ✅');
    console.log('2. Upload new images through admin panel');
    console.log('3. Images will be automatically stored in Cloudinary');
}

console.log('\n📞 Need help? Check IMAGE_STORAGE_SOLUTION.md for detailed instructions!');