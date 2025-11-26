// Restore Products Script
// Adds a complete set of mobile accessory products to the database

const https = require('https');

const RAILWAY_URL = 'https://ermimobile.up.railway.app';
const ADMIN_EMAIL = 'ermias616@gmail.com';
const ADMIN_PASSWORD = 'Ermi@0211';

console.log('📦 Product Restoration Script');
console.log('============================\n');

// Complete product catalog
const products = [
    // Wireless Earbuds
    { name: 'Wireless Earbuds Pro', price: 2500, icon: '🎧', description: 'Premium wireless earbuds with noise cancellation', stock: 50 },
    { name: 'Bluetooth Earbuds', price: 1800, icon: '🎧', description: 'High-quality Bluetooth earbuds with long battery life', stock: 75 },
    { name: 'Sport Earbuds', price: 1500, icon: '🎧', description: 'Waterproof earbuds perfect for workouts', stock: 60 },
    
    // Phone Cases
    { name: 'Silicone Phone Case', price: 300, icon: '📱', description: 'Soft silicone case with shock absorption', stock: 100 },
    { name: 'Leather Phone Case', price: 800, icon: '📱', description: 'Premium leather case with card holder', stock: 40 },
    { name: 'Clear Phone Case', price: 400, icon: '📱', description: 'Transparent case showing phone design', stock: 80 },
    
    // Chargers
    { name: 'Fast Charger 20W', price: 800, icon: '🔌', description: 'Quick charge adapter for fast charging', stock: 90 },
    { name: 'Fast Charger 30W', price: 1200, icon: '🔌', description: 'Super fast charger with USB-C', stock: 70 },
    { name: 'Wireless Charger', price: 1500, icon: '🔌', description: 'Qi wireless charging pad', stock: 50 },
    
    // Cables
    { name: 'USB-C Cable 1m', price: 200, icon: '🔗', description: 'Durable USB-C charging cable', stock: 150 },
    { name: 'USB-C Cable 2m', price: 350, icon: '🔗', description: 'Extra long USB-C cable', stock: 100 },
    { name: 'Lightning Cable', price: 400, icon: '🔗', description: 'MFi certified Lightning cable for iPhone', stock: 80 },
    
    // Screen Protectors
    { name: 'Tempered Glass Screen Protector', price: 300, icon: '🛡️', description: '9H hardness tempered glass', stock: 120 },
    { name: 'Privacy Screen Protector', price: 500, icon: '🛡️', description: 'Anti-spy privacy screen protector', stock: 60 },
    
    // Speakers
    { name: 'Bluetooth Speaker Mini', price: 1000, icon: '🔊', description: 'Portable Bluetooth speaker', stock: 45 },
    { name: 'Bluetooth Speaker Pro', price: 2500, icon: '🔊', description: 'Premium speaker with bass boost', stock: 30 },
    { name: 'Waterproof Speaker', price: 1800, icon: '🔊', description: 'IPX7 waterproof Bluetooth speaker', stock: 40 },
    
    // Phone Holders & Accessories
    { name: 'Car Phone Holder', price: 500, icon: '🚗', description: 'Magnetic car mount holder', stock: 70 },
    { name: 'Desktop Phone Stand', price: 400, icon: '📐', description: 'Adjustable phone stand for desk', stock: 85 },
    { name: 'Selfie Stick', price: 600, icon: '🤳', description: 'Extendable selfie stick with Bluetooth', stock: 55 },
    { name: 'Phone Ring Holder', price: 200, icon: '💍', description: 'Finger ring holder and stand', stock: 100 },
    
    // Memory & Storage
    { name: 'MicroSD Card 32GB', price: 600, icon: '💾', description: 'High-speed microSD card', stock: 80 },
    { name: 'MicroSD Card 64GB', price: 1000, icon: '💾', description: 'Ultra-fast 64GB storage', stock: 60 },
    { name: 'USB Flash Drive 32GB', price: 500, icon: '💾', description: 'Portable USB 3.0 flash drive', stock: 70 },
    
    // Headphones
    { name: 'Wired Earphones', price: 300, icon: '🎵', description: 'Quality wired earphones with mic', stock: 100 },
    { name: 'Over-Ear Headphones', price: 2000, icon: '🎵', description: 'Comfortable over-ear headphones', stock: 35 },
    
    // Smartwatch Accessories
    { name: 'Smartwatch Band', price: 400, icon: '⌚', description: 'Replacement band for smartwatch', stock: 65 },
    { name: 'Smartwatch Screen Protector', price: 250, icon: '⌚', description: 'Protective film for smartwatch', stock: 80 },
    
    // Other Accessories
    { name: 'Phone Cleaning Kit', price: 300, icon: '🧼', description: 'Complete phone cleaning solution', stock: 90 },
    { name: 'Cable Organizer', price: 200, icon: '📦', description: 'Keep cables neat and organized', stock: 100 },
    { name: 'Phone Tripod', price: 1200, icon: '📷', description: 'Flexible tripod for phones', stock: 40 }
];

// Login function
function login() {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        const options = {
            hostname: 'ermimobile.up.railway.app',
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            }
        };

        console.log('🔐 Logging in as admin...');

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Login successful!\n');
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Login failed: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(loginData);
        req.end();
    });
}

// Add product function
function addProduct(product) {
    return new Promise((resolve, reject) => {
        const productData = JSON.stringify(product);

        const options = {
            hostname: 'ermimobile.up.railway.app',
            path: '/api/admin/products',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': productData.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Failed to add ${product.name}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(productData);
        req.end();
    });
}

// Main execution
async function restoreProducts() {
    try {
        // Login
        await login();

        console.log(`📦 Adding ${products.length} products...\n`);

        let successCount = 0;
        let failCount = 0;

        // Add products one by one
        for (const product of products) {
            try {
                await addProduct(product);
                successCount++;
                console.log(`✅ ${successCount}/${products.length} - Added: ${product.name} (${product.price} Birr)`);
                
                // Small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                failCount++;
                console.error(`❌ Failed: ${product.name} - ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`\n🎉 Product Restoration Complete!`);
        console.log(`✅ Successfully added: ${successCount} products`);
        if (failCount > 0) {
            console.log(`❌ Failed: ${failCount} products`);
        }
        console.log(`\n📊 Total products in catalog: ${successCount}`);
        console.log('\n💡 Visit your admin panel to see the products:');
        console.log('   https://ermimobile.up.railway.app/admin.html');
        console.log('\n🌐 Visit your website to see them live:');
        console.log('   https://ermimobile.up.railway.app\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure Railway is running');
        console.log('   2. Check admin credentials');
        console.log('   3. Verify API is accessible');
        process.exit(1);
    }
}

// Run the script
restoreProducts();
