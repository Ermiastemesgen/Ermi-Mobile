#!/usr/bin/env node
/**
 * Sync Localhost Categories to Railway
 * 
 * This script:
 * 1. Exports categories from localhost database
 * 2. Uploads them to Railway via API
 */

const sqlite3 = require('sqlite3').verbose();
const https = require('https');

// Configuration
const LOCAL_DB = './emobile.db';
const RAILWAY_URL = 'https://ermimobile.up.railway.app';
const ADMIN_EMAIL = 'ermias616@gmail.com';
const ADMIN_PASSWORD = 'Ermi@0211';

console.log('🔄 Syncing Localhost Categories to Railway');
console.log('===========================================\n');

// Step 1: Export categories from localhost
async function exportLocalCategories() {
    return new Promise((resolve, reject) => {
        console.log('📂 Step 1: Reading localhost categories...');
        
        const db = new sqlite3.Database(LOCAL_DB, (err) => {
            if (err) {
                console.error('❌ Error opening local database:', err.message);
                reject(err);
                return;
            }
        });

        db.all('SELECT * FROM categories ORDER BY id', [], (err, categories) => {
            if (err) {
                console.error('❌ Error reading categories:', err.message);
                reject(err);
                return;
            }

            console.log(`✅ Found ${categories.length} categories in localhost\n`);
            
            categories.forEach((c, i) => {
                console.log(`   ${i + 1}. ${c.name}`);
            });
            console.log('');

            db.close();
            resolve(categories);
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

// Step 3: Upload category to Railway
async function uploadCategory(category) {
    return new Promise((resolve, reject) => {
        const categoryData = JSON.stringify({
            name: category.name,
            description: category.description,
            parent_id: category.parent_id
        });

        const options = {
            hostname: 'ermimobile.up.railway.app',
            path: '/api/admin/categories',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': categoryData.length
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
                    console.error(`   ⚠️  Failed to upload ${category.name}:`, data);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`   ❌ Error uploading ${category.name}:`, error.message);
            resolve(false);
        });

        req.write(categoryData);
        req.end();
    });
}

// Step 4: Upload all categories
async function uploadAllCategories(categories) {
    console.log('📤 Step 3: Uploading categories to Railway...\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        process.stdout.write(`   Uploading ${i + 1}/${categories.length}: ${category.name}... `);
        
        const success = await uploadCategory(category);
        
        if (success) {
            console.log('✅');
            successCount++;
        } else {
            console.log('❌');
            failCount++;
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('');
    console.log('📊 Upload Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📂 Total: ${categories.length}`);
}

// Main execution
async function main() {
    try {
        // Step 1: Export from localhost
        const categories = await exportLocalCategories();

        if (categories.length === 0) {
            console.log('ℹ️  No categories found in localhost database.');
            console.log('💡 Add categories locally first, then run this script again.');
            return;
        }

        // Step 2: Login to Railway
        await loginToRailway();

        // Step 3: Upload categories
        await uploadAllCategories(categories);

        console.log('\n✅ Category sync complete!');
        console.log('🌐 Check Railway admin panel: https://ermimobile.up.railway.app/admin.html');
        console.log('💡 Categories tab should now show all your categories');

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
