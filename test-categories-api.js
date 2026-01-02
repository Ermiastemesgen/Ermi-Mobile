const https = require('http');

console.log('🧪 Testing Categories API');
console.log('========================');

function testCategoriesAPI() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/categories',
        method: 'GET'
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                try {
                    const parsed = JSON.parse(data);
                    console.log(`✅ Categories API working! Found ${parsed.categories?.length || 0} categories`);
                } catch (e) {
                    console.log('❌ Invalid JSON response');
                }
            } else {
                console.log('❌ API request failed');
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Connection error:', error.message);
        console.log('💡 Make sure server is running: node server.js');
    });

    req.setTimeout(5000, () => {
        console.log('⏱️ Request timeout');
        req.destroy();
    });

    req.end();
}

// Wait a moment then test
setTimeout(testCategoriesAPI, 1000);