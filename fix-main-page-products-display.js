const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING MAIN PAGE PRODUCTS DISPLAY');
console.log('====================================');

// Fix script.js to add better error handling and debugging
function fixScriptJS() {
    console.log('\n📄 Fixing script.js...');
    
    const scriptPath = path.join(__dirname, 'script.js');
    
    if (!fs.existsSync(scriptPath)) {
        console.log('❌ script.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Replace the fetchProducts function with a more robust version
        const newFetchProducts = `
async function fetchProducts() {
    console.log('🔄 Fetching products from API...');
    console.log('API URL:', API_URL);
    
    try {
        // Show loading message
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">Loading products...</p>';
        }
        
        const response = await fetch(\`\${API_URL}/products\`);
        console.log('📡 Products API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const data = await response.json();
        console.log('📦 Products data received:', data);
        
        if (data.products && Array.isArray(data.products)) {
            products = data.products;
            allProducts = data.products;
            console.log(\`✅ Loaded \${products.length} products\`);
        } else {
            console.error('❌ Invalid products data structure:', data);
            throw new Error('Invalid products data received');
        }
        
        // Load categories for filter
        try {
            const categoriesResponse = await fetch(\`\${API_URL}/categories\`);
            console.log('📡 Categories API response status:', categoriesResponse.status);
            
            if (categoriesResponse.ok) {
                const catData = await categoriesResponse.json();
                if (catData.categories && Array.isArray(catData.categories)) {
                    categoriesData = catData.categories;
                    displayCategoryFilter(catData.categories);
                    console.log(\`✅ Loaded \${catData.categories.length} categories\`);
                } else {
                    console.warn('⚠️  Invalid categories data, using default');
                    categoriesData = [];
                }
            } else {
                console.warn('⚠️  Categories API failed, continuing without categories');
                categoriesData = [];
            }
        } catch (catError) {
            console.warn('⚠️  Categories loading failed:', catError.message);
            categoriesData = [];
        }
        
        displayProducts();
        initHeroSlider(); // Initialize hero slider with product images
        
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        
        // Show user-friendly error message
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = \`
                <div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
                    <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 1.5rem; margin: 1rem 0;">
                        <h3 style="color: #dc2626; margin: 0 0 1rem 0;">
                            <i class="fas fa-exclamation-triangle"></i> Unable to Load Products
                        </h3>
                        <p style="color: #7f1d1d; margin: 0 0 1rem 0;">
                            We're having trouble loading our products. This might be due to:
                        </p>
                        <ul style="color: #7f1d1d; text-align: left; display: inline-block; margin: 0 0 1rem 0;">
                            <li>Server connection issues</li>
                            <li>Network connectivity problems</li>
                            <li>Temporary maintenance</li>
                        </ul>
                        <button onclick="fetchProducts()" style="background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-refresh"></i> Try Again
                        </button>
                    </div>
                </div>
            \`;
        }
        
        showNotification('Error loading products. Please refresh the page or try again later.', 'error');
    }
}`;

        // Replace the existing fetchProducts function
        const fetchProductsRegex = /async function fetchProducts\(\)\s*\{[\s\S]*?\n\}/;
        if (fetchProductsRegex.test(content)) {
            content = content.replace(fetchProductsRegex, newFetchProducts);
            console.log('✅ Updated fetchProducts function with better error handling');
        } else {
            console.log('⚠️  Could not find fetchProducts function to replace');
        }
        
        // Also improve the displayProducts function
        const newDisplayProducts = `
function displayProducts() {
    console.log('🎨 Displaying products...', products.length);
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) {
        console.error('❌ Products grid element not found');
        return;
    }
    
    productsGrid.innerHTML = '';
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = \`
            <div style="text-align: center; grid-column: 1/-1; padding: 3rem;">
                <div style="background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 2rem;">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem;"></i>
                    <h3 style="color: #6b7280; margin: 0 0 0.5rem 0;">No Products Available</h3>
                    <p style="color: #9ca3af; margin: 0;">
                        Products will appear here once they are added to the store.
                    </p>
                </div>
            </div>
        \`;
        return;
    }
    
    products.forEach((product, index) => {
        console.log(\`🛍️  Rendering product \${index + 1}: \${product.name}\`);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Get image source with fallback
        const imageSrc = handleProductImage(product);
        console.log(\`🖼️  Product \${product.name} image: \${imageSrc}\`);
        
        productCard.innerHTML = \`
            <div class="product-image" \${imageSrc ? 'onclick="openLightbox(\\'' + imageSrc + '\\', \\'' + product.name + '\\')" style="cursor: zoom-in;"' : 'onclick="filterByCategory(' + (product.category_id || 'null') + ')" style="cursor: pointer;"'} title="\${imageSrc ? 'Click to view full size' : 'View ' + (product.category_name || 'all products')}">
                \${imageSrc ? 
                    '<img src="' + imageSrc + '" alt="' + product.name + '" style="width: 100%; height: 100%; object-fit: cover; image-rendering: high-quality;" onerror="handleImageError(this)">' : 
                    '<div class="image-placeholder"><i class="fas fa-image"></i><br>No Image</div>'
                }
            </div>
            <div class="product-info">
                <h3 class="product-name" onclick="filterByCategory(\${product.category_id || 'null'})" style="cursor: pointer;" title="View all \${product.category_name || 'products'}">\${product.name}</h3>
                \${product.description ? '<p class="product-description">' + product.description + '</p>' : ''}
                <p class="product-price">\${product.price ? product.price.toFixed(2) : '0.00'} <span data-translate="birr">Birr</span></p>
                <button class="add-to-cart" onclick="addToCart(\${product.id})">
                    <i class="fas fa-cart-plus"></i> <span data-translate="addToCart">Add to Cart</span>
                </button>
            </div>
        \`;
        productsGrid.appendChild(productCard);
    });
    
    console.log(\`✅ Successfully displayed \${products.length} products\`);
    
    // Update translations for newly added elements
    if (typeof updatePageLanguage === 'function') {
        updatePageLanguage();
    }
}`;

        // Replace the existing displayProducts function
        const displayProductsRegex = /function displayProducts\(\)\s*\{[\s\S]*?\n\}/;
        if (displayProductsRegex.test(content)) {
            content = content.replace(displayProductsRegex, newDisplayProducts);
            console.log('✅ Updated displayProducts function with better error handling');
        } else {
            console.log('⚠️  Could not find displayProducts function to replace');
        }
        
        // Add console logging to the initialization
        const initRegex = /(document\.addEventListener\('DOMContentLoaded', \(\) => \{[\s\S]*?console\.log\('🚀 DOM loaded, initializing\.\.\.'\);)/;
        if (initRegex.test(content)) {
            content = content.replace(initRegex, `$1
    console.log('🌐 Current URL:', window.location.href);
    console.log('🔗 API URL:', API_URL);`);
            console.log('✅ Added debugging logs to initialization');
        }
        
        fs.writeFileSync(scriptPath, content);
        console.log('✅ Updated script.js with comprehensive fixes');
        
    } catch (error) {
        console.log(`❌ Error fixing script.js: ${error.message}`);
    }
}

// Add a test endpoint to server.js if it doesn't exist
function addTestEndpoint() {
    console.log('\n🌐 Checking server.js for test endpoint...');
    
    const serverPath = path.join(__dirname, 'server.js');
    
    if (!fs.existsSync(serverPath)) {
        console.log('❌ server.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(serverPath, 'utf8');
        
        // Check if test-products endpoint already exists
        if (content.includes('/test-products')) {
            console.log('✅ Test endpoint already exists');
            return;
        }
        
        // Add test endpoint before the health check
        const healthCheckRegex = /(\/\/ ===== Health Check Endpoint =====)/;
        if (healthCheckRegex.test(content)) {
            const testEndpoint = `
// ===== Products Test Endpoint =====
app.get('/test-products', (req, res) => {
    console.log('🧪 Test products endpoint called');
    
    const query = \`
        SELECT p.*, c.name as category_name, c.parent_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
    \`;
    
    db.all(query, [], (err, products) => {
        if (err) {
            console.error('❌ Database error:', err.message);
            res.status(500).json({ 
                error: 'Database error', 
                message: err.message,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        console.log(\`📊 Found \${products.length} products in database\`);
        
        res.json({
            success: true,
            count: products.length,
            products: products,
            timestamp: new Date().toISOString(),
            database: dbPath,
            environment: process.env.NODE_ENV || 'development'
        });
    });
});

$1`;
            
            content = content.replace(healthCheckRegex, testEndpoint);
            fs.writeFileSync(serverPath, content);
            console.log('✅ Added test-products endpoint to server.js');
        } else {
            console.log('⚠️  Could not find health check endpoint to add test endpoint');
        }
        
    } catch (error) {
        console.log(`❌ Error updating server.js: ${error.message}`);
    }
}

// Main execution
function main() {
    console.log('🎯 FIXING MAIN PAGE PRODUCTS DISPLAY');
    console.log('====================================');
    console.log('This will:');
    console.log('- Add better error handling to fetchProducts()');
    console.log('- Improve displayProducts() function');
    console.log('- Add debugging and logging');
    console.log('- Add test endpoint to server');
    console.log('');
    
    fixScriptJS();
    addTestEndpoint();
    
    console.log('\n🎉 MAIN PAGE PRODUCTS FIX COMPLETED!');
    console.log('====================================');
    console.log('✅ Enhanced error handling in script.js');
    console.log('✅ Added debugging and logging');
    console.log('✅ Added test endpoint to server.js');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Start the server: node server.js');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Check browser console for debugging info');
    console.log('4. Visit /test-products to verify API is working');
    console.log('5. If still issues, check network tab in browser');
}

// Run the fixes
main();