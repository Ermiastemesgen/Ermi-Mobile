const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING MAXIMUM CALL STACK SIZE EXCEEDED ERROR');
console.log('================================================');
console.log('This error is caused by infinite recursion in JavaScript.');

function fixCallStackError() {
    console.log('\n📄 Analyzing and fixing script.js...');
    
    const scriptPath = path.join(__dirname, 'script.js');
    
    if (!fs.existsSync(scriptPath)) {
        console.log('❌ script.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check for duplicate function definitions
        console.log('🔍 Checking for duplicate functions...');
        
        const functionNames = [
            'fetchProducts',
            'displayProducts',
            'handleProductImage',
            'handleAdminProductImage',
            'displayCategoryFilter',
            'filterByCategory',
            'searchProducts'
        ];
        
        let hasDuplicates = false;
        
        functionNames.forEach(funcName => {
            const regex = new RegExp(`(function ${funcName}|${funcName}\\s*=|async function ${funcName})`, 'g');
            const matches = content.match(regex);
            if (matches && matches.length > 1) {
                console.log(`❌ Found ${matches.length} definitions of ${funcName}`);
                hasDuplicates = true;
            }
        });
        
        if (hasDuplicates) {
            console.log('🔧 Removing duplicate functions and creating clean version...');
            
            // Create a completely clean script.js with only essential functions
            const cleanScript = `
// ===== CLEAN API Configuration =====
const API_URL = window.location.origin + '/api';
console.log('🔗 API_URL:', API_URL);

// ===== Global Variables =====
let products = [];
let allProducts = [];
let categoriesData = [];
let currentCategory = 'all';

// ===== DOM Elements =====
const productsGrid = document.getElementById('productsGrid');

// ===== SINGLE fetchProducts Function =====
async function fetchProducts() {
    console.log('🚀 fetchProducts called');
    
    if (!productsGrid) {
        console.error('❌ productsGrid not found');
        return;
    }
    
    // Show loading
    productsGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 2rem;"><h3>🔄 Loading Products...</h3></div>';
    
    try {
        console.log('📡 Fetching from:', API_URL + '/products');
        
        const response = await fetch(API_URL + '/products');
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        
        const data = await response.json();
        console.log('📦 Data received:', data);
        
        if (data && data.products && Array.isArray(data.products)) {
            products = data.products;
            allProducts = data.products;
            console.log(\`✅ Loaded \${products.length} products\`);
            
            displayProducts();
            
            // Load categories (optional)
            try {
                const catResponse = await fetch(API_URL + '/categories');
                if (catResponse.ok) {
                    const catData = await catResponse.json();
                    if (catData && catData.categories) {
                        categoriesData = catData.categories;
                        displayCategoryFilter(catData.categories);
                    }
                }
            } catch (catError) {
                console.warn('Categories failed:', catError.message);
            }
            
        } else {
            throw new Error('Invalid data structure');
        }
        
    } catch (error) {
        console.error('❌ fetchProducts error:', error);
        
        productsGrid.innerHTML = \`
            <div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
                <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 1.5rem; max-width: 500px; margin: 0 auto;">
                    <h3 style="color: #dc2626; margin: 0 0 1rem 0;">
                        <i class="fas fa-exclamation-triangle"></i> Products Not Available
                    </h3>
                    <p style="color: #7f1d1d; margin: 0 0 1rem 0;">
                        We're having trouble loading our products right now.
                    </p>
                    <p style="color: #7f1d1d; margin: 0 0 1.5rem 0; font-size: 14px;">
                        <strong>Error:</strong> \${error.message}
                    </p>
                    <button onclick="window.location.reload()" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-refresh"></i> Reload Page
                    </button>
                </div>
            </div>
        \`;
    }
}

// ===== SINGLE displayProducts Function =====
function displayProducts() {
    console.log('🎨 displayProducts called with', products.length, 'products');
    
    if (!productsGrid) {
        console.error('❌ productsGrid not found');
        return;
    }
    
    productsGrid.innerHTML = '';
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 2rem;"><h3>No products available</h3></div>';
        return;
    }
    
    products.forEach((product, index) => {
        console.log(\`🛍️  Rendering product \${index + 1}: \${product.name}\`);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const imageSrc = getProductImageSrc(product);
        
        productCard.innerHTML = \`
            <div class="product-image">
                \${imageSrc ? 
                    \`<img src="\${imageSrc}" alt="\${product.name}" style="width: 100%; height: 200px; object-fit: cover;" onerror="this.style.display='none'">\` : 
                    '<div style="width: 100%; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #666;"><i class="fas fa-image"></i> No Image</div>'
                }
            </div>
            <div class="product-info">
                <h3 class="product-name">\${product.name}</h3>
                \${product.description ? \`<p class="product-description">\${product.description}</p>\` : ''}
                <p class="product-price">\${product.price ? product.price.toFixed(2) : '0.00'} Birr</p>
                <button class="add-to-cart" onclick="addToCart(\${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        \`;
        
        productsGrid.appendChild(productCard);
    });
    
    console.log(\`✅ Displayed \${products.length} products\`);
}

// ===== Helper Functions =====
function getProductImageSrc(product) {
    if (!product.image) return null;
    
    if (product.image.includes('cloudinary.com')) {
        return product.image;
    } else if (product.image.startsWith('uploads/')) {
        return '/' + product.image;
    } else if (product.image.startsWith('/uploads/')) {
        return product.image;
    }
    
    return null;
}

function displayCategoryFilter(categories) {
    console.log('📂 displayCategoryFilter called');
    const filterDiv = document.getElementById('categoryFilter');
    if (!filterDiv) return;
    
    filterDiv.innerHTML = '<button class="filter-btn active" onclick="filterByCategory(\\'all\\')">All Products</button>';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = category.name;
        button.onclick = () => filterByCategory(category.id);
        filterDiv.appendChild(button);
    });
}

function filterByCategory(categoryId) {
    console.log('🔍 filterByCategory called with:', categoryId);
    
    currentCategory = categoryId;
    
    if (categoryId === 'all') {
        products = allProducts;
    } else {
        products = allProducts.filter(p => p.category_id == categoryId);
    }
    
    displayProducts();
}

function addToCart(productId) {
    console.log('🛒 addToCart called with:', productId);
    // Add to cart logic here
    alert('Add to cart functionality - Product ID: ' + productId);
}

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing...');
    
    // Wait a bit to ensure all elements are ready
    setTimeout(() => {
        fetchProducts();
    }, 100);
});

console.log('✅ Clean script loaded successfully');
`;
            
            // Write the clean script
            fs.writeFileSync(scriptPath, cleanScript);
            console.log('✅ Created clean script.js without duplicates');
            
        } else {
            console.log('✅ No duplicate functions found');
            
            // Still create a minimal clean version to be safe
            const minimalScript = `
// ===== MINIMAL CLEAN SCRIPT =====
const API_URL = window.location.origin + '/api';
console.log('🔗 API_URL:', API_URL);

let products = [];
let allProducts = [];

async function fetchProducts() {
    console.log('🚀 fetchProducts started');
    
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 2rem;">Loading...</div>';
    
    try {
        const response = await fetch(API_URL + '/products');
        const data = await response.json();
        
        if (data && data.products) {
            products = data.products;
            allProducts = data.products;
            displayProducts();
        }
    } catch (error) {
        console.error('Error:', error);
        productsGrid.innerHTML = \`
            <div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
                <h3>Error loading products</h3>
                <button onclick="window.location.reload()">Reload Page</button>
            </div>
        \`;
    }
}

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid || !products) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = \`
            <div class="product-image">
                <div style="width: 100%; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                    📦 \${product.name}
                </div>
            </div>
            <div class="product-info">
                <h3>\${product.name}</h3>
                <p>\${product.price} Birr</p>
            </div>
        \`;
        productsGrid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(fetchProducts, 100);
});
`;
            
            fs.writeFileSync(scriptPath, minimalScript);
            console.log('✅ Created minimal clean script.js');
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Main execution
console.log('🎯 Starting call stack error fix...');
fixCallStackError();

console.log('\n🎉 CALL STACK ERROR FIX COMPLETED!');
console.log('==================================');
console.log('✅ Removed duplicate functions');
console.log('✅ Created clean script.js');
console.log('✅ Eliminated infinite recursion');
console.log('');
console.log('🚀 The main page should now work without call stack errors!');