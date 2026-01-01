const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const readline = require('readline');

// Configuration
const LOCAL_DB = './emobile.db';
let RENDER_URL = '';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Import Products from Localhost to Render');
console.log('============================================\n');

// Ask for Render URL
rl.question('Enter your Render URL (e.g., https://your-app.onrender.com): ', (url) => {
    RENDER_URL = url.trim();
    
    if (!RENDER_URL.startsWith('http')) {
        console.error('❌ Invalid URL. Must start with http:// or https://');
        rl.close();
        process.exit(1);
    }

    console.log(`\n📍 Target: ${RENDER_URL}\n`);
    
    // Ask for admin credentials
    rl.question('Enter Render admin email (default: admin@ermimobile.com): ', (email) => {
        const adminEmail = email.trim() || 'admin@ermimobile.com';
        
        rl.question('Enter Render admin password (default: admin123): ', (password) => {
            const adminPassword = password.trim() || 'admin123';
            
            rl.close();
            
            console.log('\n🔄 Starting import process...\n');
            startImport(adminEmail, adminPassword);
        });
    });
});

function startImport(email, password) {
    // Read localhost database
    const db = new sqlite3.Database(LOCAL_DB, (err) => {
        if (err) {
            console.error('❌ Error opening local database:', err.message);
            process.exit(1);
        }

        console.log('📦 Step 1: Reading localhost products...');
        
        db.all('SELECT * FROM products ORDER BY id', [], (err, products) => {
            if (err) {
                console.error('❌ Error reading products:', err.message);
                db.close();
                process.exit(1);
            }

            if (products.length === 0) {
                console.log('⚠️  No products found in localhost database');
                db.close();
                process.exit(0);
            }

            console.log(`✅ Found ${products.length} products\n`);
            
            products.forEach((p, i) => {
                console.log(`   ${i + 1}. ${p.name} - ${p.price} Birr`);
            });

            console.log('\n🔐 Step 2: Logging into Render admin...');
            loginToRender(email, password, products, db);
        });
    });
}

function loginToRender(email, password, products, db) {
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
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (response.token) {
                    console.log('✅ Logged in successfully\n');
                    uploadProducts(products, response.token, db);
                } else {
                    console.error('❌ Login failed:', data);
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

function uploadProducts(products, token, db) {
    console.log('📤 Step 3: Uploading products to Render...\n');
    
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
                'Authorization': `Bearer ${token}`,
                'Content-Length': productData.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                completed++;
                if (res.statusCode === 201 || res.statusCode === 200) {
                    uploaded++;
                    console.log(`   ✅ ${index + 1}/${products.length}: ${product.name}`);
                } else {
                    failed++;
                    console.log(`   ❌ ${index + 1}/${products.length}: ${product.name} (${res.statusCode})`);
                }

                if (completed === products.length) {
                    showSummary(uploaded, failed, products.length, db);
                }
            });
        });

        req.on('error', (error) => {
            completed++;
            failed++;
            console.log(`   ❌ ${index + 1}/${products.length}: ${product.name} (${error.message})`);
            
            if (completed === products.length) {
                showSummary(uploaded, failed, products.length, db);
            }
        });

        req.write(productData);
        req.end();
    });
}

function showSummary(uploaded, failed, total, db) {
    console.log('\n============================================');
    console.log('📊 Import Summary');
    console.log('============================================');
    console.log(`✅ Successful: ${uploaded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📦 Total: ${total}`);
    console.log('============================================\n');
    
    if (uploaded > 0) {
        console.log(`🎉 Successfully imported ${uploaded} products to Render!`);
        console.log(`🌐 Check your admin panel: ${RENDER_URL}/admin.html\n`);
    }
    
    db.close();
}
