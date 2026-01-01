const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const readline = require('readline');

const LOCAL_DB = './emobile.db';
let RENDER_URL = '';
let authToken = '';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Complete Import: Categories + Products + Images');
console.log('===================================================\n');

rl.question('Enter your Render URL (e.g., https://your-app.onrender.com): ', (url) => {
    RENDER_URL = url.trim();
    
    if (!RENDER_URL.startsWith('http')) {
        console.error('❌ Invalid URL');
        rl.close();
        process.exit(1);
    }

    console.log(`\n📍 Target: ${RENDER_URL}\n`);
    
    rl.question('Enter admin email (default: admin@ermimobile.com): ', (email) => {
        const adminEmail = email.trim() || 'admin@ermimobile.com';
        
        rl.question('Enter admin password (default: admin123): ', (password) => {
            const adminPassword = password.trim() || 'admin123';
            rl.close();
            
            console.log('\n🔄 Starting complete import...\n');
            startImport(adminEmail, adminPassword);
        });
    });
});

function startImport(email, password) {
    const db = new sqlite3.Database(LOCAL_DB, (err) => {
        if (err) {
            console.error('❌ Error opening database:', err.message);
            process.exit(1);
        }

        console.log('📦 Step 1: Reading localhost data...\n');
        
        // Read categories
        db.all('SELECT * FROM categories ORDER BY id', [], (err, categories) => {
            if (err) {
                console.error('❌ Error reading categories:', err.message);
                db.close();
                process.exit(1);
            }

            console.log(`✅ Found ${categories.length} categories`);
            
            // Read products
            db.all('SELECT * FROM products ORDER BY id', [], (err, products) => {
                if (err) {
                    console.error('❌ Error reading products:', err.message);
                    db.close();
                    process.exit(1);
                }

                console.log(`✅ Found ${products.length} products`);
                
                // Read product images
                db.all('SELECT * FROM product_images ORDER BY product_id, display_order', [], (err, images) => {
                    if (err) {
                        console.log('⚠️  No product images found');
                        images = [];
                    } else {
                        console.log(`✅ Found ${images.length} product images`);
                    }

                    console.log('\n🔐 Step 2: Logging into Render...');
                    loginToRender(email, password, { categories, products, images }, db);
                });
            });
        });
    });
}

function loginToRender(email, password, data, db) {
    const loginData = JSON.stringify({ email, password });
    const hostname = RENDER_URL.replace('https://', '').replace('http://', '');

    const options = {
        hostname: hostname,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            try {
                const response = JSON.parse(responseData);
                if (response.token) {
                    authToken = response.token;
                    console.log('✅ Logged in successfully\n');
                    uploadCategories(data, db);
                } else {
                    console.error('❌ Login failed:', responseData);
                    db.close();
                }
            } catch (error) {
                console.error('❌ Login error:', error.message);
                db.close();
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Connection error:', error.message);
        db.close();
    });

    req.write(loginData);
    req.end();
}

function uploadCategories(data, db) {
    console.log('📁 Step 3: Uploading categories...\n');
    
    const { categories, products, images } = data;
    
    if (categories.length === 0) {
        console.log('⚠️  No categories to upload\n');
        uploadProducts(products, images, db);
        return;
    }

    const hostname = RENDER_URL.replace('https://', '').replace('http://', '');
    let uploaded = 0;
    let failed = 0;
    let completed = 0;

    categories.forEach((category, index) => {
        const categoryData = JSON.stringify({
            name: category.name,
            description: category.description,
            parent_id: category.parent_id
        });

        const options = {
            hostname: hostname,
            path: '/api/categories',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'Content-Length': categoryData.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                completed++;
                if (res.statusCode === 201 || res.statusCode === 200) {
                    uploaded++;
                    console.log(`   ✅ ${index + 1}/${categories.length}: ${category.name}`);
                } else {
                    failed++;
                    console.log(`   ❌ ${index + 1}/${categories.length}: ${category.name}`);
                }

                if (completed === categories.length) {
                    console.log(`\n   Categories: ${uploaded} uploaded, ${failed} failed\n`);
                    uploadProducts(products, images, db);
                }
            });
        });

        req.on('error', (error) => {
            completed++;
            failed++;
            console.log(`   ❌ ${index + 1}/${categories.length}: ${category.name}`);
            
            if (completed === categories.length) {
                console.log(`\n   Categories: ${uploaded} uploaded, ${failed} failed\n`);
                uploadProducts(products, images, db);
            }
        });

        req.write(categoryData);
        req.end();
    });
}

function uploadProducts(products, images, db) {
    console.log('📦 Step 4: Uploading products...\n');
    
    if (products.length === 0) {
        console.log('⚠️  No products to upload\n');
        uploadProductImages(images, db);
        return;
    }

    const hostname = RENDER_URL.replace('https://', '').replace('http://', '');
    let uploaded = 0;
    let failed = 0;
    let completed = 0;

    products.forEach((product, index) => {
        const productData = JSON.stringify({
            name: product.name,
            price: product.price,
            icon: product.icon,
            description: product.description,
            stock: product.stock,
            category_id: product.category_id,
            image: product.image
        });

        const options = {
            hostname: hostname,
            path: '/api/products',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'Content-Length': productData.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                completed++;
                if (res.statusCode === 201 || res.statusCode === 200) {
                    uploaded++;
                    console.log(`   ✅ ${index + 1}/${products.length}: ${product.name}`);
                } else {
                    failed++;
                    console.log(`   ❌ ${index + 1}/${products.length}: ${product.name}`);
                }

                if (completed === products.length) {
                    console.log(`\n   Products: ${uploaded} uploaded, ${failed} failed\n`);
                    uploadProductImages(images, db);
                }
            });
        });

        req.on('error', (error) => {
            completed++;
            failed++;
            console.log(`   ❌ ${index + 1}/${products.length}: ${product.name}`);
            
            if (completed === products.length) {
                console.log(`\n   Products: ${uploaded} uploaded, ${failed} failed\n`);
                uploadProductImages(images, db);
            }
        });

        req.write(productData);
        req.end();
    });
}

function uploadProductImages(images, db) {
    if (images.length === 0) {
        console.log('⚠️  No product images to upload\n');
        showFinalSummary(db);
        return;
    }

    console.log('🖼️  Step 5: Uploading product images...\n');
    
    const hostname = RENDER_URL.replace('https://', '').replace('http://', '');
    let uploaded = 0;
    let failed = 0;
    let completed = 0;

    images.forEach((image, index) => {
        const imageData = JSON.stringify({
            product_id: image.product_id,
            image_url: image.image_url,
            display_order: image.display_order
        });

        const options = {
            hostname: hostname,
            path: '/api/product-images',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'Content-Length': imageData.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                completed++;
                if (res.statusCode === 201 || res.statusCode === 200) {
                    uploaded++;
                    console.log(`   ✅ ${index + 1}/${images.length}: Image for product ${image.product_id}`);
                } else {
                    failed++;
                    console.log(`   ❌ ${index + 1}/${images.length}: Image for product ${image.product_id}`);
                }

                if (completed === images.length) {
                    console.log(`\n   Images: ${uploaded} uploaded, ${failed} failed\n`);
                    showFinalSummary(db);
                }
            });
        });

        req.on('error', (error) => {
            completed++;
            failed++;
            console.log(`   ❌ ${index + 1}/${images.length}: Image for product ${image.product_id}`);
            
            if (completed === images.length) {
                console.log(`\n   Images: ${uploaded} uploaded, ${failed} failed\n`);
                showFinalSummary(db);
            }
        });

        req.write(imageData);
        req.end();
    });
}

function showFinalSummary(db) {
    console.log('===================================================');
    console.log('🎉 Import Complete!');
    console.log('===================================================\n');
    console.log(`🌐 Check your Render site:`);
    console.log(`   Admin: ${RENDER_URL}/admin.html`);
    console.log(`   Store: ${RENDER_URL}\n`);
    db.close();
}
