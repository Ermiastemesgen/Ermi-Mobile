// Delete Power Bank Product from Railway Database
// Run this script to remove the Power Bank product

const https = require('https');

const RAILWAY_URL = 'https://ermimobile.up.railway.app';
const ADMIN_EMAIL = 'ermias616@gmail.com';
const ADMIN_PASSWORD = 'Ermi@0211';

// Alternative: Try without authentication first
const USE_AUTH = false;

console.log('🗑️  Power Bank Deletion Script for Railway');
console.log('==========================================\n');

// Step 1: Login to get session
function loginAdmin() {
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

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Login successful!\n');
                    resolve(JSON.parse(data));
                } else {
                    console.error('❌ Login failed:', data);
                    reject(new Error('Login failed'));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Login error:', error.message);
            reject(error);
        });

        req.write(loginData);
        req.end();
    });
}

// Step 2: Get all products
function getAllProducts() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'ermimobile.up.railway.app',
            path: '/api/products',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log('📦 Fetching all products...');

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(data);
                    console.log(`✅ Found ${result.products.length} products\n`);
                    resolve(result.products);
                } else {
                    console.error('❌ Failed to fetch products:', data);
                    reject(new Error('Failed to fetch products'));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Error fetching products:', error.message);
            reject(error);
        });

        req.end();
    });
}

// Step 3: Delete product by ID
function deleteProduct(productId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'ermimobile.up.railway.app',
            path: `/api/admin/products/${productId}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log(`🗑️  Deleting product ID: ${productId}...`);

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Product deleted successfully!\n');
                    resolve(true);
                } else {
                    console.error('❌ Failed to delete product:', data);
                    reject(new Error('Failed to delete product'));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Error deleting product:', error.message);
            reject(error);
        });

        req.end();
    });
}

// Main execution
async function main() {
    try {
        // Step 1: Login
        await loginAdmin();

        // Step 2: Get all products
        const products = await getAllProducts();

        // Step 3: Find Power Bank products
        console.log('🔍 Searching for Power Bank products...\n');
        const powerBankProducts = products.filter(p => 
            p.name.toLowerCase().includes('power bank') || 
            p.name.toLowerCase().includes('powerbank')
        );

        if (powerBankProducts.length === 0) {
            console.log('ℹ️  No Power Bank products found.');
            console.log('\n📋 Available products:');
            products.forEach(p => {
                console.log(`   - ${p.name} (ID: ${p.id})`);
            });
            return;
        }

        console.log(`Found ${powerBankProducts.length} Power Bank product(s):\n`);
        powerBankProducts.forEach(p => {
            console.log(`   📱 ${p.name}`);
            console.log(`      ID: ${p.id}`);
            console.log(`      Price: ${p.price} Birr`);
            console.log(`      Stock: ${p.stock}`);
            console.log('');
        });

        // Step 4: Delete each Power Bank product
        console.log('🗑️  Deleting Power Bank products...\n');
        for (const product of powerBankProducts) {
            await deleteProduct(product.id);
        }

        console.log('✅ All Power Bank products deleted successfully!');
        console.log('\n🎉 Done! Check your Railway admin panel to verify.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure Railway is running');
        console.log('   2. Check your admin credentials');
        console.log('   3. Try deleting manually via admin panel:');
        console.log('      https://ermimobile.up.railway.app/admin.html');
    }
}

// Run the script
main();
