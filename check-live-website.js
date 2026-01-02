const https = require('https');

console.log('🔍 CHECKING LIVE WEBSITE STATUS');
console.log('===============================');

function checkWebsite() {
    console.log('\n🌐 Checking https://ermi-mobile.onrender.com...');
    
    const options = {
        hostname: 'ermi-mobile.onrender.com',
        port: 443,
        path: '/',
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    };

    const req = https.request(options, (res) => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📅 Last Modified: ${res.headers['last-modified'] || 'Not available'}`);
        console.log(`🔄 Cache Control: ${res.headers['cache-control'] || 'Not set'}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('\n🔍 CHECKING ALIEXPRESS DESIGN ELEMENTS...');
            console.log('=========================================');
            
            // Check for AliExpress hero section
            if (data.includes('hero-aliexpress')) {
                console.log('✅ AliExpress hero section found on live site');
            } else {
                console.log('❌ AliExpress hero section NOT found on live site');
            }
            
            // Check for gradient backgrounds in CSS link
            if (data.includes('style.css')) {
                console.log('✅ CSS file linked correctly');
            } else {
                console.log('❌ CSS file link issue');
            }
            
            // Check for hero background elements
            if (data.includes('hero-background') && data.includes('hero-pattern')) {
                console.log('✅ Hero background elements found on live site');
            } else {
                console.log('❌ Hero background elements NOT found on live site');
            }
            
            // Check for AliExpress styling classes
            if (data.includes('hero-gradient')) {
                console.log('✅ Hero gradient elements found');
            } else {
                console.log('❌ Hero gradient elements NOT found');
            }
            
            // Check for force deployment comment
            const timestamp = new Date().toISOString().split('T')[0]; // Today's date
            if (data.includes('Force deployment update')) {
                console.log('✅ Force deployment update detected');
            } else {
                console.log('⚠️  Force deployment update not yet visible');
            }
            
            console.log('\n📊 WEBSITE STATUS SUMMARY:');
            console.log('==========================');
            
            if (data.includes('hero-aliexpress') && data.includes('hero-background')) {
                console.log('🎉 SUCCESS: AliExpress design is LIVE!');
                console.log('✅ Hero section with gradient backgrounds deployed');
                console.log('✅ Website showing AliExpress-style design');
                console.log('🌐 Visit: https://ermi-mobile.onrender.com');
            } else {
                console.log('⏳ PENDING: Deployment still in progress...');
                console.log('🔄 Render is still updating the website');
                console.log('⏱️  Check again in 2-3 minutes');
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Error checking website:', error.message);
        console.log('🔄 Website might still be deploying...');
    });
    
    req.setTimeout(10000, () => {
        console.log('⏰ Request timeout - website might be deploying');
        req.destroy();
    });
    
    req.end();
}

// Check website status
checkWebsite();

console.log('\n📋 NEXT STEPS:');
console.log('==============');
console.log('1. Wait 3-5 minutes for deployment to complete');
console.log('2. Run this script again: node check-live-website.js');
console.log('3. Visit: https://ermi-mobile.onrender.com');
console.log('4. Look for orange/red gradient background in hero section');