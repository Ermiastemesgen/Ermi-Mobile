const https = require('https');

console.log('🔍 CHECKING RENDER DEPLOYMENT STATUS');
console.log('====================================');

const websiteUrl = 'https://ermi-mobile.onrender.com';
const healthUrl = 'https://ermi-mobile.onrender.com/health';
const productsUrl = 'https://ermi-mobile.onrender.com/api/products';

function checkEndpoint(url, name) {
    return new Promise((resolve) => {
        console.log(`\n🌐 Checking ${name}...`);
        
        const request = https.get(url, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                if (response.statusCode === 200) {
                    console.log(`✅ ${name}: Working (Status: ${response.statusCode})`);
                    
                    if (name === 'Health Check') {
                        try {
                            const healthData = JSON.parse(data);
                            console.log(`   📊 Status: ${healthData.status}`);
                            console.log(`   🕐 Timestamp: ${healthData.timestamp}`);
                            console.log(`   🌍 Environment: ${healthData.environment}`);
                        } catch (e) {
                            console.log('   📄 Response received');
                        }
                    } else if (name === 'Products API') {
                        try {
                            const productsData = JSON.parse(data);
                            console.log(`   📦 Products loaded: ${productsData.products?.length || 0}`);
                        } catch (e) {
                            console.log('   📄 Response received');
                        }
                    }
                } else {
                    console.log(`❌ ${name}: Error (Status: ${response.statusCode})`);
                }
                resolve();
            });
        });
        
        request.on('error', (error) => {
            console.log(`❌ ${name}: Connection failed`);
            console.log(`   Error: ${error.message}`);
            resolve();
        });
        
        request.setTimeout(10000, () => {
            console.log(`⏱️ ${name}: Timeout (still deploying?)`);
            request.destroy();
            resolve();
        });
    });
}

async function checkDeployment() {
    console.log(`🌐 Website URL: ${websiteUrl}`);
    console.log(`🔑 Admin Panel: ${websiteUrl}/admin.html`);
    console.log(`👤 Admin Login: ermias616@gmail.com / Ermi@0211`);
    
    await checkEndpoint(healthUrl, 'Health Check');
    await checkEndpoint(productsUrl, 'Products API');
    await checkEndpoint(websiteUrl, 'Main Website');
    
    console.log('\n🎯 DEPLOYMENT STATUS SUMMARY');
    console.log('============================');
    console.log('✅ If all checks passed: Your website is live and working!');
    console.log('⏱️ If timeouts occurred: Deployment may still be in progress (wait 2-3 minutes)');
    console.log('❌ If errors occurred: Check Render dashboard for deployment logs');
    console.log('\n🌐 Visit your website: https://ermi-mobile.onrender.com');
}

checkDeployment();