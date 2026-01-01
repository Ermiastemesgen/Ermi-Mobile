const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

console.log('🔍 RENDER IMAGE PERSISTENCE - FINAL FIX');
console.log('=====================================');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to database');
});

// Check all products and their images
db.all(`
    SELECT p.id, p.name, p.image, pi.image_url 
    FROM products p 
    LEFT JOIN product_images pi ON p.id = pi.product_id
`, [], (err, rows) => {
    if (err) {
        console.error('❌ Error fetching products:', err.message);
        return;
    }

    console.log(`\n📊 Found ${rows.length} product image records`);
    console.log('=====================================');

    let localImages = 0;
    let cloudinaryImages = 0;
    let brokenProducts = [];
    let productMap = new Map();

    rows.forEach((row) => {
        if (!productMap.has(row.id)) {
            productMap.set(row.id, {
                id: row.id,
                name: row.name,
                images: [],
                hasLocalImages: false
            });
        }

        const product = productMap.get(row.id);
        
        // Check main image
        if (row.image) {
            product.images.push(row.image);
        }
        
        // Check additional images
        if (row.image_url) {
            product.images.push(row.image_url);
        }
    });

    productMap.forEach((product) => {
        console.log(`\n🛍️  Product: ${product.name} (ID: ${product.id})`);
        
        if (product.images.length === 0) {
            console.log(`   ⚠️  No images found`);
            return;
        }
        
        product.images.forEach((image, index) => {
            if (image) {
                if (image.includes('cloudinary.com')) {
                    console.log(`   ✅ Image ${index + 1}: Cloudinary (PERSISTENT)`);
                    cloudinaryImages++;
                } else if (image.startsWith('/uploads/') || image.startsWith('uploads/')) {
                    console.log(`   ❌ Image ${index + 1}: Local storage (WILL DISAPPEAR)`);
                    localImages++;
                    product.hasLocalImages = true;
                } else {
                    console.log(`   ⚠️  Image ${index + 1}: Unknown format - ${image}`);
                }
            }
        });

        if (product.hasLocalImages) {
            brokenProducts.push(product);
        }
    });

    console.log('\n📈 SUMMARY');
    console.log('=====================================');
    console.log(`✅ Cloudinary images (persistent): ${cloudinaryImages}`);
    console.log(`❌ Local images (will disappear): ${localImages}`);
    console.log(`🔧 Products needing fix: ${brokenProducts.length}`);

    if (brokenProducts.length > 0) {
        console.log('\n🚨 PRODUCTS WITH LOCAL IMAGES (NEED FIXING):');
        console.log('=====================================');
        brokenProducts.forEach(product => {
            console.log(`- ${product.name} (ID: ${product.id})`);
        });

        console.log('\n💡 TO FIX THESE PRODUCTS:');
        console.log('1. Go to your deployed Render admin panel');
        console.log('2. Edit each product listed above');
        console.log('3. Re-upload the images through the admin interface');
        console.log('4. Save the product');
        console.log('5. Images will now be stored in Cloudinary permanently');
    } else {
        console.log('\n🎉 ALL IMAGES ARE USING CLOUDINARY!');
        console.log('Your images will persist across deployments.');
    }

    db.close();
});