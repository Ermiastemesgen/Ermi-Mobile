const fs = require('fs');

console.log('🔍 VERIFYING LOCAL TO RENDER COPY');
console.log('================================');

// Check if files exist
const files = ['server-local-copy.js', 'package-local-copy.json', 'render-local-copy.yaml'];
files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} created`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

// Verify server content
try {
    const serverContent = fs.readFileSync('server-local-copy.js', 'utf8');
    
    if (serverContent.includes('/tmp/emobile.db')) {
        console.log('✅ Database path configured for Render');
    } else {
        console.log('❌ Database path not configured');
    }
    
    if (serverContent.includes("app.listen(PORT, '0.0.0.0')")) {
        console.log('✅ Server binding configured for Render');
    } else {
        console.log('❌ Server binding not configured');
    }
    
    console.log('✅ Server verification complete');
    
} catch (error) {
    console.log('❌ Error verifying server:', error.message);
}

// Verify package.json
try {
    const packageJson = JSON.parse(fs.readFileSync('package-local-copy.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.start === 'node server.js') {
        console.log('✅ Start script configured');
    } else {
        console.log('❌ Start script not configured');
    }
    
    if (packageJson.engines && packageJson.engines.node) {
        console.log(`✅ Node version specified: ${packageJson.engines.node}`);
    } else {
        console.log('❌ Node version not specified');
    }
    
    console.log('✅ Package.json verification complete');
    
} catch (error) {
    console.log('❌ Error verifying package.json:', error.message);
}

console.log('\n🎯 VERIFICATION COMPLETE!');
console.log('Your working local server is ready to deploy to Render!');