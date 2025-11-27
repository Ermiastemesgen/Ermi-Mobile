const sqlite3 = require('sqlite3').verbose();
const https = require('https');

const LOCAL_DB = './emobile.db';
const RENDER_URL = process.env.RENDER_URL || 'https://your-app.onrender.com'; // Update this!

console.log('🔄 Syncing Localhost Database to Render');
console.log('==========================================\n');

// Read localhost database
const db = new sqlite3.Database(LOCAL_DB, (err) => {
    if (err) {
        console.error('❌ Error opening local database:', err.message);
        process.exit(1);
    }

    console.log('📦 Step 1: Reading localhost database...');
    
    db.all('SELECT * FROM products ORDER BY id', [], (err, products) => {
        if (err) {
            console.error('❌ Error reading products:', err.message);
            db.close();
            process.exit(1);
        }

        console.log(`✅ Found ${products.length} products in localhost\n`);
        
        products.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} - ${p.price} Birr`);
        });

        console.log('\n🔐 Step 2: Logging into Render...');
        
        // Login to Render
        const loginData = JSON.stringify({
            email: 'admin@ermimobile.com',
            password: 'admin123'
        });

        const loginOptions = {
            hostname: RENDER_URL.replace('https://', '').replace('http://', ''),
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            }
        };

        const loginReq = https.request(loginOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (response.token) {
                        console.log('✅ Logged into Render successfully\n');
                        uploadProducts(products, response.token);
                    } else {
                        console.error('❌ Login failed:', data);
                        db.close();
                        process.exit(1);
                    }
                } catch (error) {
                    console.error('❌ Login failed:', data);
                    db.close();
                    process.exit(1);
                }
            });
        });

        loginReq.on('error', (error) => {
            console.error('❌ Login failed:', error.message);
            db.close();
            process.exit(1);
        });

        loginReq.write(loginData);
        loginReq.end();
    });
});

function uploadProducts(products, token) {
    console.log('📤 Step 3: Uploading products to Render...\n');
    
    let uploaded = 0;
    let failed = 0;

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
            hostname: RENDER_URL.replace('https://', '').replace('http://', ''),
            path: '/api/products',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': productData.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 201 || res.statusCode === 200) {
                    uploaded++;
                    console.log(`   Uploading ${index + 1}/${products.length}: ${product.name}... ✅`);
                } else {
                    failed++;
                    console.log(`   Uploading ${index + 1}/${products.length}: ${product.name}... ❌`);
                }

                if (uploaded + failed === products.length) {
                    console.log(`\n📊 Upload Summary:`);
                    console.log(`   ✅ Successful: ${uploaded}`);
                    console.log(`   ❌ Failed: ${failed}`);
                    console.log(`   📦 Total: ${products.length}`);
                    console.log('\n✅ Sync complete!');
                    console.log(`🌐 Check Render admin panel: ${RENDER_URL}/admin.html`);
                    db.close();
                }
            });
        });

        req.on('error', (error) => {
            failed++;
            console.log(`   Uploading ${index + 1}/${products.length}: ${product.name}... ❌`);
            
            if (uploaded + failed === products.length) {
                console.log(`\n📊 Upload Summary:`);
                console.log(`   ✅ Successful: ${uploaded}`);
                console.log(`   ❌ Failed: ${failed}`);
                console.log(`   📦 Total: ${products.length}`);
                db.close();
            }
        });

        req.write(productData);
        req.end();
    });
}
