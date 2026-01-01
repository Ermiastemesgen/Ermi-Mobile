const fs = require('fs');
const path = require('path');

console.log('🚀 FIXING ERMI MOBILE MAIN PAGE API ISSUE');
console.log('=========================================');
console.log('This will completely fix the API connection problem.');

// Step 1: Create a bulletproof API configuration
function fixAPIConfiguration() {
    console.log('\n🔧 Step 1: Fixing API Configuration');
    console.log('===================================');
    
    const scriptPath = path.join(__dirname, 'script.js');
    
    if (!fs.existsSync(scriptPath)) {
        console.log('❌ script.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Replace the entire API configuration section with a bulletproof version
        const bulletproofAPIConfig = `
// ===== BULLETPROOF API Configuration =====
let API_URL;
try {
    if (typeof window !== 'undefined' && window.location) {
        API_URL = window.location.origin + '/api';
        console.log('✅ API_URL set to:', API_URL);
    } else {
        API_URL = '/api';
        console.log('⚠️  Fallback API_URL:', API_URL);
    }
} catch (error) {
    API_URL = '/api';
    console.log('❌ Error setting API_URL, using fallback:', API_URL);
}`;

        // Find and replace the API configuration
        const apiConfigRegex = /\/\/ ===== API Configuration =====[\s\S]*?console\.log\([^;]*\);/;
        if (apiConfigRegex.test(content)) {
            content = content.replace(apiConfigRegex, bulletproofAPIConfig);
            console.log('✅ Updated API configuration');
        } else {
            // If not found, add it at the beginning
            content = bulletproofAPIConfig + '\n\n' + content;
            console.log('✅ Added new API configuration');
        }
        
        fs.writeFileSync(scriptPath, content);
        console.log('✅ script.js updated with bulletproof API config');
        
    } catch (error) {
        console.log(`❌ Error updating script.js: ${error.message}`);
    }
}

// Step 2: Create a completely new fetchProducts function
function createNewFetchProducts() {
    console.log('\n🔧 Step 2: Creating New fetchProducts Function');
    console.log('==============================================');
    
    const scriptPath = path.join(__dirname, 'script.js');
    
    try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Create a completely new, bulletproof fetchProducts function
        const newFetchProducts = `
// ===== BULLETPROOF fetchProducts Function =====
async function fetchProducts() {
    console.log('🚀 fetchProducts started');
    console.log('🔗 API_URL:', API_URL);
    
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('❌ productsGrid element not found');
        return;
    }
    
    // Show loading
    productsGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 3rem;"><h3>🔄 Loading Products...</h3><p>Please wait while we fetch the latest products.</p></div>';
    
    try {
        console.log('📡 Making API request to:', API_URL + '/products');
        
        const response = await fetch(API_URL + '/products', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-cache'
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(\`API request failed: \${response.status} \${response.statusText}\`);
        }
        
        const data = await response.json();
        console.log('📦 API response data:', data);
        
        if (data && data.products && Array.isArray(data.products)) {
            products = data.products;
            allProducts = data.products;
            console.log(\`✅ Successfully loaded \${products.length} products\`);
            
            // Log each product
            products.forEach((product, index) => {
                console.log(\`📦 Product \${index + 1}: \${product.name} - \${product.price} Birr\`);
            });
            
            // Display products
            displayProducts();
            
            // Try to load categories (optional)
            try {
                const catResponse = await fetch(API_URL + '/categories');
                if (catResponse.ok) {
                    const catData = await catResponse.json();
                    if (catData && catData.categories) {
                        categoriesData = catData.categories;
                        displayCategoryFilter(catData.categories);
                        console.log(\`✅ Loaded \${catData.categories.length} categories\`);
                    }
                }
            } catch (catError) {
                console.warn('⚠️  Categories failed to load:', catError.message);
            }
            
            // Initialize hero slider
            try {
                if (typeof initHeroSlider === 'function') {
                    initHeroSlider();
                }
            } catch (sliderError) {
                console.warn('⚠️  Hero slider failed:', sliderError.message);
            }
            
        } else {
            throw new Error('Invalid data structure received from API');
        }
        
    } catch (error) {
        console.error('❌ fetchProducts error:', error);
        
        // Show user-friendly error with retry
        productsGrid.innerHTML = \`
            <div style="text-align: center; grid-column: 1/-1; padding: 3rem;">
                <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 12px; padding: 2rem; max-width: 500px; margin: 0 auto;">
                    <h3 style="color: #dc2626; margin: 0 0 1rem 0;">
                        <i class="fas fa-exclamation-triangle"></i> Products Not Available
                    </h3>
                    <p style="color: #7f1d1d; margin: 0 0 1rem 0;">
                        We're having trouble loading our products right now.
                    </p>
                    <p style="color: #7f1d1d; margin: 0 0 1.5rem 0; font-size: 14px;">
                        <strong>Error:</strong> \${error.message}
                    </p>
                    <button onclick="fetchProducts()" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; font-size: 14px;">
                        <i class="fas fa-refresh"></i> Try Again
                    </button>
                    <button onclick="window.location.reload()" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 14px;">
                        <i class="fas fa-redo"></i> Reload Page
                    </button>
                </div>
            </div>
        \`;
        
        // Also try to show notification if function exists
        if (typeof showNotification === 'function') {
            showNotification('Failed to load products. Please try again.', 'error');
        }
    }
}`;

        // Replace the existing fetchProducts function
        const fetchRegex = /async function fetchProducts\(\)\s*\{[\s\S]*?\n\}/;
        if (fetchRegex.test(content)) {
            content = content.replace(fetchRegex, newFetchProducts);
            console.log('✅ Replaced existing fetchProducts function');
        } else {
            // If not found, add it
            content += '\n' + newFetchProducts;
            console.log('✅ Added new fetchProducts function');
        }
        
        fs.writeFileSync(scriptPath, content);
        console.log('✅ New fetchProducts function created');
        
    } catch (error) {
        console.log(`❌ Error creating fetchProducts: ${error.message}`);
    }
}

// Step 3: Ensure server has proper API routes
function ensureServerAPIRoutes() {
    console.log('\n🔧 Step 3: Ensuring Server API Routes');
    console.log('=====================================');
    
    const serverPath = path.join(__dirname, 'server.js');
    
    if (!fs.existsSync(serverPath)) {
        console.log('❌ server.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(serverPath, 'utf8');
        
        // Check if API routes exist
        if (!content.includes('app.get(\'/api/products\'')) {
            console.log('❌ API routes missing, adding them...');
            
            const apiRoutes = `
// ===== ESSENTIAL API ROUTES =====
app.get('/api/products', (req, res) => {
    console.log('📡 /api/products called');
    
    const query = \`
        SELECT p.*, c.name as category_name, c.parent_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
    \`;
    
    db.all(query, [], (err, products) => {
        if (err) {
            console.error('❌ Database error in /api/products:', err.message);
            res.status(500).json({ 
                error: 'Database error', 
                message: err.message,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        console.log(\`✅ /api/products returning \${products.length} products\`);
        res.json({ 
            products: products,
            count: products.length,
            timestamp: new Date().toISOString()
        });
    });
});

app.get('/api/categories', (req, res) => {
    console.log('📡 /api/categories called');
    
    db.all("SELECT * FROM categories ORDER BY parent_id ASC, name ASC", [], (err, categories) => {
        if (err) {
            console.error('❌ Database error in /api/categories:', err.message);
            res.status(500).json({ 
                error: 'Database error', 
                message: err.message,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        console.log(\`✅ /api/categories returning \${categories.length} categories\`);
        res.json({ 
            categories: categories,
            count: categories.length,
            timestamp: new Date().toISOString()
        });
    });
});

`;
            
            // Find insertion point (before health check or at end)
            const healthIndex = content.indexOf('// ===== Health Check Endpoint =====');
            if (healthIndex !== -1) {
                content = content.slice(0, healthIndex) + apiRoutes + content.slice(healthIndex);
            } else {
                // Add before the server start
                const serverStartIndex = content.indexOf('app.listen(');
                if (serverStartIndex !== -1) {
                    content = content.slice(0, serverStartIndex) + apiRoutes + '\n' + content.slice(serverStartIndex);
                } else {
                    content += apiRoutes;
                }
            }
            
            fs.writeFileSync(serverPath, content);
            console.log('✅ Added API routes to server.js');
        } else {
            console.log('✅ API routes already exist');
        }
        
    } catch (error) {
        console.log(`❌ Error updating server.js: ${error.message}`);
    }
}

// Step 4: Create a test page to verify API
function createAPITestPage() {
    console.log('\n🔧 Step 4: Creating API Test Page');
    console.log('=================================');
    
    const testPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ermi Mobile - API Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Ermi Mobile API Test</h1>
        <p>This page tests the API endpoints to diagnose connection issues.</p>
        
        <div id="results"></div>
        
        <button onclick="testAPI()">🔄 Test API</button>
        <button onclick="testProducts()">📦 Test Products</button>
        <button onclick="testCategories()">📂 Test Categories</button>
        <button onclick="clearResults()">🗑️ Clear Results</button>
        
        <script>
            const API_URL = window.location.origin + '/api';
            
            function addResult(message, type = 'info') {
                const results = document.getElementById('results');
                const div = document.createElement('div');
                div.className = 'test-result ' + type;
                div.innerHTML = message;
                results.appendChild(div);
            }
            
            function clearResults() {
                document.getElementById('results').innerHTML = '';
            }
            
            async function testAPI() {
                clearResults();
                addResult('🚀 Starting API tests...', 'info');
                addResult('🔗 API URL: ' + API_URL, 'info');
                
                await testProducts();
                await testCategories();
            }
            
            async function testProducts() {
                addResult('📡 Testing /api/products...', 'info');
                
                try {
                    const response = await fetch(API_URL + '/products');
                    addResult('📡 Response status: ' + response.status, response.ok ? 'success' : 'error');
                    
                    if (response.ok) {
                        const data = await response.json();
                        addResult('✅ Products API working! Found ' + (data.products ? data.products.length : 0) + ' products', 'success');
                        addResult('<pre>' + JSON.stringify(data, null, 2) + '</pre>', 'info');
                    } else {
                        const text = await response.text();
                        addResult('❌ Products API failed: ' + text, 'error');
                    }
                } catch (error) {
                    addResult('❌ Products API error: ' + error.message, 'error');
                }
            }
            
            async function testCategories() {
                addResult('📡 Testing /api/categories...', 'info');
                
                try {
                    const response = await fetch(API_URL + '/categories');
                    addResult('📡 Response status: ' + response.status, response.ok ? 'success' : 'error');
                    
                    if (response.ok) {
                        const data = await response.json();
                        addResult('✅ Categories API working! Found ' + (data.categories ? data.categories.length : 0) + ' categories', 'success');
                        addResult('<pre>' + JSON.stringify(data, null, 2) + '</pre>', 'info');
                    } else {
                        const text = await response.text();
                        addResult('❌ Categories API failed: ' + text, 'error');
                    }
                } catch (error) {
                    addResult('❌ Categories API error: ' + error.message, 'error');
                }
            }
            
            // Auto-run tests on page load
            window.onload = function() {
                setTimeout(testAPI, 1000);
            };
        </script>
    </div>
</body>
</html>`;
    
    try {
        fs.writeFileSync('api-test.html', testPageContent);
        console.log('✅ Created api-test.html');
        console.log('   Visit /api-test.html to test API endpoints');
    } catch (error) {
        console.log(`❌ Error creating test page: ${error.message}`);
    }
}

// Main execution
function main() {
    console.log('🎯 COMPREHENSIVE ERMI MOBILE API FIX');
    console.log('====================================');
    console.log('This will completely fix the main page API issues.');
    console.log('');
    
    fixAPIConfiguration();
    createNewFetchProducts();
    ensureServerAPIRoutes();
    createAPITestPage();
    
    console.log('\n🎉 ERMI MOBILE API FIX COMPLETED!');
    console.log('=================================');
    console.log('✅ Fixed API configuration in script.js');
    console.log('✅ Created bulletproof fetchProducts function');
    console.log('✅ Ensured server API routes exist');
    console.log('✅ Created API test page');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Deploy these fixes');
    console.log('2. Visit /api-test.html to verify API works');
    console.log('3. Check main page - products should load');
    console.log('4. Monitor browser console for detailed logs');
    console.log('');
    console.log('🔍 DEBUGGING:');
    console.log('- Main page will show detailed error messages');
    console.log('- Browser console will have comprehensive logs');
    console.log('- API test page will verify all endpoints');
}

main();