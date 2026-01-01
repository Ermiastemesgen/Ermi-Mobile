const https = require('https');

const RAILWAY_URL = 'https://ermimobile.up.railway.app';

console.log('🔍 Checking Railway status...');
console.log('📍 URL:', RAILWAY_URL);
console.log('');

// Check if Railway is accessible
https.get(RAILWAY_URL, (res) => {
    console.log('✅ Railway is accessible');
    console.log('📊 Status Code:', res.statusCode);
    console.log('📋 Headers:', res.headers);
    
    if (res.statusCode === 200) {
        console.log('\n✅ Railway is UP and running!');
        console.log('💡 You can now sync products');
    } else if (res.statusCode === 502 || res.statusCode === 503) {
        console.log('\n⚠️  Railway is DOWN or restarting');
        console.log('💡 Wait a few minutes and try again');
    } else {
        console.log('\n⚠️  Unexpected status:', res.statusCode);
    }
}).on('error', (err) => {
    console.error('❌ Railway is not accessible');
    console.error('Error:', err.message);
    console.log('\n💡 Possible reasons:');
    console.log('   1. Railway deployment stopped (payment required)');
    console.log('   2. Railway is still deploying');
    console.log('   3. Network connection issue');
});
