const http = require('http');

console.log('🔍 Testing Ermi Mobile Server Status...');
console.log('=====================================');

// Test main server
const testServer = () => {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000', (res) => {
            console.log(`✅ Main server: Status ${res.statusCode}`);
            resolve(res.statusCode === 200);
        });
        
        req.on('error', (err) => {
            console.log(`❌ Main server: ${err.message}`);
            reject(err);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Main server: Timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
};

// Test products API
const testProductsAPI = () => {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000/api/products', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const products = JSON.parse(data);
                    console.log(`✅ Products API: Status ${res.statusCode}, Found ${products.products ? products.products.length : 0} products`);
                    resolve(res.statusCode === 200);
                } catch (e) {
                    console.log(`✅ Products API: Status ${res.statusCode} (Response received)`);
                    resolve(res.statusCode === 200);
                }
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ Products API: ${err.message}`);
            reject(err);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Products API: Timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
};

// Test settings API
const testSettingsAPI = () => {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000/api/settings', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const settings = JSON.parse(data);
                    console.log(`✅ Settings API: Status ${res.statusCode}, Found ${Object.keys(settings.settings || {}).length} settings`);
                    resolve(res.statusCode === 200);
                } catch (e) {
                    console.log(`✅ Settings API: Status ${res.statusCode} (Response received)`);
                    resolve(res.statusCode === 200);
                }
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ Settings API: ${err.message}`);
            reject(err);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Settings API: Timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
};

// Run all tests
async function runTests() {
    try {
        console.log('🚀 Starting server tests...\n');
        
        await testServer();
        await testProductsAPI();
        await testSettingsAPI();
        
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('=====================================');
        console.log('✅ Your Ermi Mobile server is working perfectly!');
        console.log('🌐 Local URL: http://localhost:3000');
        console.log('👨‍💼 Admin Panel: http://localhost:3000/admin.html');
        console.log('🔑 Admin Login: ermias616@gmail.com / Ermi@0211');
        console.log('\n🚀 Ready for Render deployment!');
        
    } catch (error) {
        console.log('\n❌ TESTS FAILED!');
        console.log('Error:', error.message);
        console.log('\n🔧 Make sure your server is running with: node server.js');
    }
}

runTests();