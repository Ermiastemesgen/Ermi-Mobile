const fs = require('fs');
const path = require('path');

console.log('🔧 CLOUDINARY SETUP FOR RENDER');
console.log('===============================');

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found .env file');
} catch (error) {
    console.log('❌ .env file not found');
    process.exit(1);
}

// Check current Cloudinary configuration
const hasCloudName = envContent.includes('CLOUDINARY_CLOUD_NAME=') && !envContent.includes('PUT_YOUR_REAL_CLOUD_NAME_HERE');
const hasApiKey = envContent.includes('CLOUDINARY_API_KEY=') && !envContent.includes('PUT_YOUR_REAL_API_KEY_HERE');
const hasApiSecret = envContent.includes('CLOUDINARY_API_SECRET=') && !envContent.includes('PUT_YOUR_REAL_API_SECRET_HERE');

console.log('\n📊 CURRENT CLOUDINARY STATUS:');
console.log('===============================');
console.log(`Cloud Name: ${hasCloudName ? '✅ Configured' : '❌ Missing'}`);
console.log(`API Key: ${hasApiKey ? '✅ Configured' : '❌ Missing'}`);
console.log(`API Secret: ${hasApiSecret ? '✅ Configured' : '❌ Missing'}`);

if (!hasCloudName || !hasApiKey || !hasApiSecret) {
    console.log('\n🚨 CLOUDINARY NOT PROPERLY CONFIGURED!');
    console.log('=======================================');
    console.log('This is why your images disappear on Render deployment.');
    console.log('');
    console.log('TO FIX THIS:');
    console.log('1. Go to https://cloudinary.com');
    console.log('2. Sign up for a free account');
    console.log('3. Go to your Dashboard');
    console.log('4. Copy your credentials:');
    console.log('   - Cloud Name');
    console.log('   - API Key');
    console.log('   - API Secret');
    console.log('5. Update your .env file with real values');
    console.log('6. Deploy to Render');
    console.log('');
    console.log('EXAMPLE .env configuration:');
    console.log('CLOUDINARY_CLOUD_NAME=your-actual-cloud-name');
    console.log('CLOUDINARY_API_KEY=123456789012345');
    console.log('CLOUDINARY_API_SECRET=your-actual-secret-key');
} else {
    console.log('\n🎉 CLOUDINARY IS PROPERLY CONFIGURED!');
    console.log('=====================================');
    console.log('Your images should persist on Render.');
    console.log('');
    console.log('If images are still disappearing:');
    console.log('1. Make sure you deployed with the correct .env values');
    console.log('2. Re-upload images through the deployed admin panel');
    console.log('3. Check that Render has the environment variables set');
}

console.log('\n🔍 NEXT STEPS:');
console.log('===============');
console.log('1. Run: node fix-render-images-final.js');
console.log('2. Check which products need image re-upload');
console.log('3. Fix them through your deployed admin panel');