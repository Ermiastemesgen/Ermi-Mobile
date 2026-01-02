const https = require('https');

console.log('🔍 CHECKING RENDER CATEGORY FIX DEPLOYMENT');
console.log('==========================================');

const renderUrl = 'https://ermi-mobile.onrender.com';
const categoriesUrl = 'https://ermi-mobile.onrender.com/api/categories';
const adminUrl = 'https://ermi-mobile.onrender.com/admin.html';

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
                    
                    if (name === 'Categories API') {
                        try {
                            const categoriesData = JSON.parse(data);
                            console.log(`   📦 Categories loaded: ${categoriesData.categories?.length || 0}`);
                            if (categoriesData.categories && categoriesData.categories.length > 0) {
                                console.log(`   📋 Categories: ${categoriesData.categories.map(c => c.name).join(', ')}`);
                            }
                        } catch (e) {
                            console.log('   📄 Response received (not JSON)');
                        }
                    } else if (name === 'Admin Panel') {
                        if (data.includes('Categories') && data.includes('category')) {
                            console.log('   ✅ Admin panel includes category management');
                        } else {
                            console.log('   ⚠️ Admin panel may not have category management yet');
                        }
                    }
                } else {
                    console.log(`❌ ${name}: Error (Status: ${response.statusCode})`);
                    if (response.statusCode === 502) {
                        console.log('   🔄 Deployment may still be in progress...');
                    }
                }
                resolve();
            });
        });
        
        request.on('error', (error) => {
            console.log(`❌ ${name}: Connection failed`);
            console.log(`   Error: ${error.message}`);
            resolve();
        });
        
        request.setTimeout(15000, () => {
            console.log(`⏱️ ${name}: Timeout (deployment in progress?)`);
            request.destroy();
            resolve();
        });
    });
}

async function checkDeployment() {
    console.log(`🌐 Render Website: ${renderUrl}`);
    console.log(`🔑 Admin Panel: ${adminUrl}`);
    console.log(`👤 Admin Login: ermias616@gmail.com / Ermi@0211`);
    
    await checkEndpoint(categoriesUrl, 'Categories API');
    await checkEndpoint(adminUrl, 'Admin Panel');
    await checkEndpoint(renderUrl, 'Main Website');
    
    console.log('\n🎯 CATEGORY FIX DEPLOYMENT STATUS');
    console.log('=================================');
    console.log('✅ If Categories API is working: Admin panel category loading is fixed!');
    console.log('⏱️ If 502 errors: Deployment still in progress (wait 2-3 minutes)');
    console.log('❌ If other errors: Check Render dashboard for deployment logs');
    console.log('\n📱 Test your admin panel:');
    console.log('1. Go to: https://ermi-mobile.onrender.com/admin.html');
    console.log('2. Login with: ermias616@gmail.com / Ermi@0211');
    console.log('3. Click "Categories" in the sidebar');
    console.log('4. Verify categories load without showing "Loading..." forever');
}

checkDeployment();