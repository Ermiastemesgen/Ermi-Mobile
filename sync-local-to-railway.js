#!/usr/bin/env node
/**
 * Sync Localhost Database to Railway
 * 
 * This script:
 * 1. Exports products from localhost database
 * 2. Uploads them to Railway via API
 * 
 * Usage: node sync-local-to-railway.js
 */

const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const fs = require('fs');

// Configuration
const LOCAL_DB = './emobile.db';
const RAILWAY_URL = 'https://ermimobile.up.railway.app';
const ADMIN_EMAIL = 'ermias616@gmail.com';
const ADMIN_PASSWORD = 'Ermi@0211';

console.log('🔄 Syncing Localhost Database to Railway');
console.log('==========================================\n');

// Step 1: Export products from localhost
async function exportLocalProducts() {
    return new Promise((resolve, reject) => {
        console.log('📦 Step 1: Reading localhost database...');
        
        const db = new sqlite3.Database(LOCAL_DB, (err) => {
            if (err) {
                console.error('❌ Error opening local database:', err.message);
                reject(err);
                return;
            }
        });

        db.all('SELECT * FROM products', [], (err, products) => {
            if (err) {
                console.error('❌ Error reading products:', err.message);
                reject(err);
                return;
            }

            console.log(`✅ Found ${products.length} products in localhost\n`);
            
            products.forEach((p, i) => {
                console.log(`   ${i + 1}. ${p.name} - ${p.price} Birr`);
            });
            console.log('');

            db.close();
            resolve(products);
        });
    });
}

// Step 2: Login to Railway
async function loginToRailway() {
    return new Promise((resolve, reject) => {
        console.log('🔐 Step 2: Logging into Railway...');

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

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Logged into Railway successfully\n');
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

// Step 3: Upload product to Railway
async function uploadProduct(product) {
    return new Promise((resolve, reject) => {
        const productData = JSON.stringify({
            name: product.name,
            price: product.price,
            icon: product.icon,
            description: product.description,
            stock: product.stock || 100,
            category_id: product.category_id
        });

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

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(true);
                } else {
                    console.error(`   ⚠️  Failed to upload ${product.name}:`, data);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`   ❌ Error uploading ${product.name}:`, error.message);
            resolve(false);
        });

        req.write(productData);
        req.end();
    });
}

// Step 4: Upload all products
async function uploadAllProducts(products) {
    console.log('📤 Step 3: Uploading products to Railway...\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        process.stdout.write(`   Uploading ${i + 1}/${products.length}: ${product.name}... `);
        
        const success = await uploadProduct(product);
        
        if (success) {
            console.log('✅');
            successCount++;
        } else {
            console.log('❌');
            failCount++;
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('');
    console.log('📊 Upload Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📦 Total: ${products.length}`);
}

// Main execution
async function main() {
    try {
        // Step 1: Export from localhost
        const products = await exportLocalProducts();

        if (products.length === 0) {
            console.log('ℹ️  No products found in localhost database.');
            console.log('💡 Add products locally first, then run this script again.');
            return;
        }

        // Step 2: Login to Railway
        await loginToRailway();

        // Step 3: Upload products
        await uploadAllProducts(products);

        console.log('\n✅ Sync complete!');
        console.log('🌐 Check Railway admin panel: https://ermimobile.up.railway.app/admin.html');

    } catch (error) {
        console.error('\n❌ Sync failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure localhost database exists (emobile.db)');
        console.log('   2. Verify Railway is accessible');
        console.log('   3. Check admin credentials are correct');
        console.log('   4. Ensure Railway deployment is active');
    }
}

// Run the script
main();
