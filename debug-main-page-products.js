const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 DEBUGGING MAIN PAGE PRODUCTS');
console.log('===============================');

// Database path
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

console.log(`Database path: ${dbPath}`);

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to database');
    
    // Test the exact same query that the API uses
    testProductsAPI();
});

function testProductsAPI() {
    console.log('\n🧪 TESTING PRODUCTS API QUERY');
    console.log('==============================');
    
    // This is the same query used in server.js for /api/products
    const query = `
        SELECT p.*, c.name as category_name, c.parent_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
    `;
    
    db.all(query, [], (err, products) => {
        if (err) {
            console.error('❌ Database query error:', err.message);
            return;
        }
        
        console.log(`📊 Found ${products.length} products in database`);
        
        if (products.length === 0) {
            console.log('🚨 NO PRODUCTS FOUND!');
            console.log('This is why the main page shows no products.');
            console.log('');
            console.log('💡 SOLUTIONS:');
            console.log('1. Add products through admin panel');
            console.log('2. Run seed script to add sample products');
            console.log('3. Import products from backup');
        } else {
            console.log('\n📋 PRODUCTS FOUND:');
            console.log('==================');
            
            products.forEach((product, index) => {
                console.log(`\n${index + 1}. ${product.name} (ID: ${product.id})`);
                console.log(`   Price: ${product.price} Birr`);
                console.log(`   Category: ${product.category_name || 'No category'}`);
                console.log(`   Image: ${product.image || 'No image'}`);
                console.log(`   Description: ${product.description ? product.description.substring(0, 50) + '...' : 'No description'}`);
            });
            
            console.log('\n✅ PRODUCTS ARE AVAILABLE IN DATABASE');
            console.log('====================================');
            console.log('If main page still shows no products, check:');
            console.log('1. API endpoint /api/products is working');
            console.log('2. JavaScript fetchProducts() function');
            console.log('3. Network requests in browser console');
            console.log('4. CORS settings');
        }
        
        // Test categories too
        testCategoriesAPI();
    });
}

function testCategoriesAPI() {
    console.log('\n🧪 TESTING CATEGORIES API QUERY');
    console.log('================================');
    
    const query = `
        SELECT * FROM categories 
        ORDER BY parent_id ASC, name ASC
    `;
    
    db.all(query, [], (err, categories) => {
        if (err) {
            console.error('❌ Categories query error:', err.message);
            return;
        }
        
        console.log(`📊 Found ${categories.length} categories in database`);
        
        if (categories.length === 0) {
            console.log('⚠️  NO CATEGORIES FOUND');
            console.log('This might affect product filtering');
        } else {
            console.log('\n📋 CATEGORIES FOUND:');
            console.log('====================');
            
            categories.forEach((category, index) => {
                console.log(`${index + 1}. ${category.name} (ID: ${category.id}, Parent: ${category.parent_id || 'None'})`);
            });
        }
        
        // Test server endpoints
        testServerEndpoints();
    });
}

function testServerEndpoints() {
    console.log('\n🌐 TESTING SERVER ENDPOINTS');
    console.log('===========================');
    
    const http = require('http');
    const port = process.env.PORT || 3000;
    
    // Test if server is running locally
    const options = {
        hostname: 'localhost',
        port: port,
        path: '/api/products',
        method: 'GET',
        timeout: 5000
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log(`✅ API /api/products responded with ${jsonData.products ? jsonData.products.length : 0} products`);
                
                if (jsonData.products && jsonData.products.length > 0) {
                    console.log('✅ API is working correctly');
                    console.log('');
                    console.log('🔍 IF MAIN PAGE STILL SHOWS NO PRODUCTS:');
                    console.log('1. Check browser console for JavaScript errors');
                    console.log('2. Check network tab for failed API requests');
                    console.log('3. Verify fetchProducts() function is called');
                    console.log('4. Check if displayProducts() is working');
                } else {
                    console.log('❌ API returned no products');
                }
            } catch (error) {
                console.log(`❌ API response parsing error: ${error.message}`);
                console.log(`Raw response: ${data.substring(0, 200)}...`);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log(`❌ Server not running locally: ${error.message}`);
        console.log('💡 Start the server with: node server.js');
    });
    
    req.on('timeout', () => {
        console.log('❌ Server request timeout');
        req.destroy();
    });
    
    req.end();
    
    // Close database after a delay
    setTimeout(() => {
        db.close();
        console.log('\n🎯 DIAGNOSIS COMPLETE');
        console.log('====================');
        console.log('Check the results above to identify the issue.');
    }, 2000);
}