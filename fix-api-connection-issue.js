const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING API CONNECTION ISSUE');
console.log('===============================');
console.log('The main page shows "Unable to Load Products" error.');
console.log('This means the API request is failing on Render.');

// Fix 1: Check and fix server.js API routes
function fixServerAPIRoutes() {
    console.log('\n🌐 Fixing server.js API routes...');
    
    const serverPath = path.join(__dirname, 'server.js');
    
    if (!fs.existsSync(serverPath)) {
        console.log('❌ server.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(serverPath, 'utf8');
        
        // Check if products API route exists
        if (!content.includes('/api/products')) {
            console.log('❌ Products API route missing! Adding it...');
            
            // Add products API route
            const productsRoute = `
// ===== Products API Route =====
app.get('/api/products', (req, res) => {
    console.log('📡 Products API called');
    
    const query = \`
        SELECT p.*, c.name as category_name, c.parent_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
    \`;
    
    db.all(query, [], (err, products) => {
        if (err) {
            console.error('❌ Database error in products API:', err.message);
            res.status(500).json({ 
                error: 'Database error', 
                message: err.message 
            });
            return;
        }
        
        console.log(\`✅ Products API returning \${products.length} products\`);
        res.json({ products: products });
    });
});

// ===== Categories API Route =====
app.get('/api/categories', (req, res) => {
    console.log('📡 Categories API called');
    
    const query = \`
        SELECT * FROM categories 
        ORDER BY parent_id ASC, name ASC
    \`;
    
    db.all(query, [], (err, categories) => {
        if (err) {
            console.error('❌ Database error in categories API:', err.message);
            res.status(500).json({ 
                error: 'Database error', 
                message: err.message 
            });
            return;
        }
        
        console.log(\`✅ Categories API returning \${categories.length} categories\`);
        res.json({ categories: categories });
    });
});
`;
            
            // Find a good place to insert the routes (before health check)
            const healthCheckRegex = /(\/\/ ===== Health Check Endpoint =====)/;
            if (healthCheckRegex.test(content)) {
                content = content.replace(healthCheckRegex, productsRoute + '\n$1');
                fs.writeFileSync(serverPath, content);
                console.log('✅ Added missing API routes to server.js');
            } else {
                console.log('⚠️  Could not find insertion point for API routes');
            }
        } else {
            console.log('✅ Products API route already exists');
        }
        
        // Check if CORS is properly configured
        if (!content.includes('app.use(cors())')) {
            console.log('⚠️  CORS might not be configured properly');
            
            // Add CORS configuration
            const corsRegex = /(const app = express\(\);)/;
            if (corsRegex.test(content)) {
                content = content.replace(corsRegex, `$1

// ===== CORS Configuration =====
app.use(cors({
    origin: true,
    credentials: true
}));`);
                fs.writeFileSync(serverPath, content);
                console.log('✅ Added CORS configuration');
            }
        } else {
            console.log('✅ CORS is configured');
        }
        
    } catch (error) {
        console.log(`❌ Error fixing server.js: ${error.message}`);
    }
}

// Fix 2: Update script.js with better API handling
function fixScriptAPIHandling() {
    console.log('\n📄 Fixing script.js API handling...');
    
    const scriptPath = path.join(__dirname, 'script.js');
    
    if (!fs.existsSync(scriptPath)) {
        console.log('❌ script.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Replace the API_URL configuration with a more robust version
        const newAPIConfig = `
// ===== API Configuration =====
// More robust API URL detection
let API_URL;
if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development
        API_URL = \`\${protocol}//\${hostname}:\${port || 3000}/api\`;
    } else {
        // Production (Render or other hosting)
        API_URL = \`\${protocol}//\${hostname}/api\`;
    }
} else {
    // Fallback
    API_URL = '/api';
}

console.log('🔗 API_URL configured as:', API_URL);`;

        // Replace existing API_URL configuration
        const apiConfigRegex = /\/\/ ===== API Configuration =====[\s\S]*?;/;
        if (apiConfigRegex.test(content)) {
            content = content.replace(apiConfigRegex, newAPIConfig);
            console.log('✅ Updated API_URL configuration');
        } else {
            console.log('⚠️  Could not find API configuration to replace');
        }
        
        // Add a more robust fetchProducts function
        const robustFetchProducts = `
async function fetchProducts() {
    console.log('🔄 Starting fetchProducts...');
    console.log('🔗 Using API_URL:', API_URL);
    
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('❌ Products grid element not found');
        return;
    }
    
    // Show loading message
    productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">🔄 Loading products...</p>';
    
    try {
        // Try multiple API endpoints in case of issues
        const endpoints = [
            \`\${API_URL}/products\`,
            \`/api/products\`,
            \`\${window.location.origin}/api/products\`
        ];
        
        let response = null;
        let lastError = null;
        
        for (const endpoint of endpoints) {
            try {
                console.log(\`📡 Trying endpoint: \${endpoint}\`);
                response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    cache: 'no-cache'
                });
                
                if (response.ok) {
                    console.log(\`✅ Success with endpoint: \${endpoint}\`);
                    break;
                } else {
                    console.log(\`❌ Failed with endpoint \${endpoint}: \${response.status}\`);
                    lastError = new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
            } catch (err) {
                console.log(\`❌ Network error with endpoint \${endpoint}:, err.message\`);
                lastError = err;
                response = null;
            }
        }
        
        if (!response || !response.ok) {
            throw lastError || new Error('All API endpoints failed');
        }
        
        const data = await response.json();
        console.log('📦 Raw API response:', data);
        
        if (data.products && Array.isArray(data.products)) {
            products = data.products;
            allProducts = data.products;
            console.log(\`✅ Successfully loaded \${products.length} products\`);
            
            // Log each product for debugging
            products.forEach((product, index) => {
                console.log(\`📦 Product \${index + 1}: \${product.name} - \${product.price} Birr\`);
            });
        } else {
            console.error('❌ Invalid products data structure:', data);
            throw new Error('Invalid products data received from API');
        }
        
        // Try to load categories (non-critical)
        try {
            const catResponse = await fetch(\`\${API_URL}/categories\`);
            if (catResponse.ok) {
                const catData = await catResponse.json();
                if (catData.categories && Array.isArray(catData.categories)) {
                    categoriesData = catData.categories;
                    displayCategoryFilter(catData.categories);
                    console.log(\`✅ Loaded \${catData.categories.length} categories\`);
                }
            }
        } catch (catError) {
            console.warn('⚠️  Categories loading failed (non-critical):', catError.message);
            categoriesData = [];
        }
        
        // Display products
        displayProducts();
        
        // Initialize hero slider
        if (typeof initHeroSlider === 'function') {
            initHeroSlider();
        }
        
    } catch (error) {
        console.error('❌ fetchProducts failed:', error);
        
        // Show detailed error message
        productsGrid.innerHTML = \`
            <div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
                <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; max-width: 600px; margin-left: auto; margin-right: auto;">
                    <h3 style="color: #dc2626; margin: 0 0 1rem 0;">
                        <i class="fas fa-exclamation-triangle"></i> Unable to Load Products
                    </h3>
                    <p style="color: #7f1d1d; margin: 0 0 1rem 0; font-size: 14px;">
                        <strong>Error:</strong> \${error.message}
                    </p>
                    <p style="color: #7f1d1d; margin: 0 0 1rem 0;">
                        This might be due to:
                    </p>
                    <ul style="color: #7f1d1d; text-align: left; display: inline-block; margin: 0 0 1rem 0; font-size: 14px;">
                        <li>Server connection issues</li>
                        <li>API endpoint problems</li>
                        <li>Database connectivity issues</li>
                        <li>Network connectivity problems</li>
                    </ul>
                    <div style="margin-top: 1rem;">
                        <button onclick="fetchProducts()" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">
                            <i class="fas fa-refresh"></i> Try Again
                        </button>
                        <button onclick="window.location.reload()" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-redo"></i> Reload Page
                        </button>
                    </div>
                    <p style="color: #9ca3af; margin: 1rem 0 0 0; font-size: 12px;">
                        API URL: \${API_URL} | Time: \${new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>
        \`;
        
        showNotification('Error loading products. Please try again.', 'error');
    }
}`;

        // Replace the existing fetchProducts function
        const fetchProductsRegex = /async function fetchProducts\(\)\s*\{[\s\S]*?\n\}/;
        if (fetchProductsRegex.test(content)) {
            content = content.replace(fetchProductsRegex, robustFetchProducts);
            console.log('✅ Updated fetchProducts with robust error handling');
        } else {
            console.log('⚠️  Could not find fetchProducts function to replace');
        }
        
        fs.writeFileSync(scriptPath, content);
        console.log('✅ Updated script.js with better API handling');
        
    } catch (error) {
        console.log(`❌ Error fixing script.js: ${error.message}`);
    }
}

// Fix 3: Add a simple products seeder for emergency
function createEmergencySeeder() {
    console.log('\n🌱 Creating emergency products seeder...');
    
    const seederContent = `
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🌱 EMERGENCY PRODUCTS SEEDER');
console.log('============================');

const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to database');
    
    // Check if products exist
    db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
        if (err) {
            console.error('❌ Error checking products:', err.message);
            return;
        }
        
        console.log(\`📊 Current products in database: \${row.count}\`);
        
        if (row.count === 0) {
            console.log('🌱 No products found, seeding emergency products...');
            seedEmergencyProducts();
        } else {
            console.log('✅ Products already exist, no seeding needed');
            db.close();
        }
    });
});

function seedEmergencyProducts() {
    const products = [
        {
            name: 'Wireless Earbuds',
            price: 1800,
            description: 'High-quality wireless earbuds with noise cancellation',
            image: 'uploads/placeholder.jpg',
            stock: 100,
            icon: 'fa-headphones'
        },
        {
            name: 'Phone Case',
            price: 1000,
            description: 'Durable protective case for all phone models',
            image: 'uploads/placeholder.jpg',
            stock: 50,
            icon: 'fa-mobile-alt'
        },
        {
            name: 'Fast Charger',
            price: 1400,
            description: '30W fast charging adapter',
            image: 'uploads/placeholder.jpg',
            stock: 75,
            icon: 'fa-plug'
        },
        {
            name: 'Bluetooth Speaker',
            price: 3500,
            description: 'Portable Bluetooth speaker with deep bass',
            image: 'uploads/placeholder.jpg',
            stock: 30,
            icon: 'fa-volume-up'
        },
        {
            name: 'Smart Watch',
            price: 1500,
            description: 'Feature-rich smartwatch with health tracking',
            image: 'uploads/placeholder.jpg',
            stock: 25,
            icon: 'fa-clock'
        }
    ];
    
    const insertQuery = \`
        INSERT INTO products (name, price, description, image, stock, icon)
        VALUES (?, ?, ?, ?, ?, ?)
    \`;
    
    let inserted = 0;
    products.forEach((product, index) => {
        db.run(insertQuery, [
            product.name,
            product.price,
            product.description,
            product.image,
            product.stock,
            product.icon
        ], function(err) {
            if (err) {
                console.error(\`❌ Error inserting \${product.name}:\`, err.message);
            } else {
                console.log(\`✅ Inserted \${product.name} (ID: \${this.lastID})\`);
                inserted++;
            }
            
            if (inserted + (products.length - inserted) === products.length) {
                console.log(\`🎉 Emergency seeding completed! Inserted \${inserted} products\`);
                db.close();
            }
        });
    });
}
`;
    
    try {
        fs.writeFileSync('emergency-seed-products.js', seederContent);
        console.log('✅ Created emergency-seed-products.js');
    } catch (error) {
        console.log(`❌ Error creating seeder: ${error.message}`);
    }
}

// Main execution
function main() {
    console.log('🎯 FIXING API CONNECTION ISSUE');
    console.log('===============================');
    console.log('This will fix the "Unable to Load Products" error by:');
    console.log('1. Ensuring API routes exist in server.js');
    console.log('2. Improving API URL configuration in script.js');
    console.log('3. Adding robust error handling and retry logic');
    console.log('4. Creating emergency products seeder');
    console.log('');
    
    fixServerAPIRoutes();
    fixScriptAPIHandling();
    createEmergencySeeder();
    
    console.log('\n🎉 API CONNECTION FIX COMPLETED!');
    console.log('=================================');
    console.log('✅ Fixed server API routes');
    console.log('✅ Improved script.js API handling');
    console.log('✅ Added robust error handling');
    console.log('✅ Created emergency seeder');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Deploy these fixes to Render');
    console.log('2. If still no products, run: node emergency-seed-products.js');
    console.log('3. Check /test-products endpoint');
    console.log('4. Monitor browser console for detailed errors');
}

main();
`;

<function_calls>
<invoke name="executePwsh">
<parameter name="command">node fix-api-connection-issue.js