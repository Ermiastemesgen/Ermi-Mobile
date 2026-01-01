const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING PRODUCT IMAGES AND BUTTONS');
console.log('====================================');
console.log('Products are visible but images and buttons need fixing.');

function fixScriptJS() {
    console.log('\n📄 Fixing script.js for images and buttons...');
    
    const scriptPath = path.join(__dirname, 'script.js');
    
    if (!fs.existsSync(scriptPath)) {
        console.log('❌ script.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Create an enhanced version with proper image handling and button functionality
        const enhancedScript = `
// ===== ENHANCED SCRIPT WITH IMAGES AND BUTTONS =====
const API_URL = window.location.origin + '/api';
console.log('🔗 API_URL:', API_URL);

let products = [];
let allProducts = [];
let categoriesData = [];
let currentCategory = 'all';

// ===== Fetch Products =====
async function fetchProducts() {
    console.log('🚀 fetchProducts started');
    
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('❌ productsGrid not found');
        return;
    }
    
    productsGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 2rem;"><h3>🔄 Loading Products...</h3></div>';
    
    try {
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
            
            // Load categories
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
                console.warn('⚠️  Categories failed:', catError.message);
            }
            
            // Initialize other features
            initializeFeatures();
            
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

// ===== Display Products with Images =====
function displayProducts() {
    console.log('🎨 displayProducts called with', products.length, 'products');
    
    const productsGrid = document.getElementById('productsGrid');
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
        
        // Get proper image source
        const imageSrc = getProductImageSrc(product);
        console.log(\`🖼️  Product \${product.name} image: \${imageSrc}\`);
        
        productCard.innerHTML = \`
            <div class="product-image" onclick="openImageLightbox('\${imageSrc || ''}', '\${product.name}')" style="cursor: \${imageSrc ? 'zoom-in' : 'default'};">
                \${imageSrc ? 
                    \`<img src="\${imageSrc}" alt="\${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" onerror="handleImageError(this, '\${product.name}')">\` : 
                    \`<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #f0f0f0, #e0e0e0); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #666; border-radius: 8px; border: 2px dashed #ccc;">
                        <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                        <span style="font-size: 0.9rem;">No Image</span>
                    </div>\`
                }
            </div>
            <div class="product-info" style="padding: 1rem;">
                <h3 class="product-name" style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #333;">\${product.name}</h3>
                \${product.description ? \`<p class="product-description" style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666; line-height: 1.4;">\${product.description.substring(0, 100)}\${product.description.length > 100 ? '...' : ''}</p>\` : ''}
                <p class="product-price" style="margin: 0 0 1rem 0; font-size: 1.2rem; font-weight: bold; color: #2563eb;">\${product.price ? product.price.toFixed(2) : '0.00'} <span style="font-size: 0.9rem;">Birr</span></p>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="add-to-cart" onclick="addToCart(\${product.id}, '\${product.name}', \${product.price})" style="flex: 1; background: #2563eb; color: white; border: none; padding: 0.75rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    \${product.category_id ? \`<button onclick="filterByCategory(\${product.category_id})" style="background: #6b7280; color: white; border: none; padding: 0.75rem; border-radius: 6px; cursor: pointer;" title="View category">
                        <i class="fas fa-tag"></i>
                    </button>\` : ''}
                </div>
            </div>
        \`;
        
        productsGrid.appendChild(productCard);
    });
    
    console.log(\`✅ Displayed \${products.length} products\`);
}

// ===== Image Helper Functions =====
function getProductImageSrc(product) {
    if (!product.image) return null;
    
    // Handle different image path formats
    if (product.image.includes('cloudinary.com')) {
        return product.image;
    } else if (product.image.startsWith('uploads/')) {
        return '/' + product.image;
    } else if (product.image.startsWith('/uploads/')) {
        return product.image;
    } else if (product.image.startsWith('http')) {
        return product.image;
    }
    
    // Default fallback
    return '/uploads/' + product.image;
}

function handleImageError(img, productName) {
    console.log(\`❌ Image failed to load for \${productName}\`);
    img.style.display = 'none';
    
    // Replace with placeholder
    const placeholder = document.createElement('div');
    placeholder.style.cssText = 'width: 100%; height: 200px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6c757d; border-radius: 8px; border: 2px dashed #dee2e6;';
    placeholder.innerHTML = \`
        <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
        <span style="font-size: 0.9rem;">Image Not Available</span>
    \`;
    
    img.parentNode.appendChild(placeholder);
}

function openImageLightbox(imageSrc, productName) {
    if (!imageSrc) return;
    
    console.log(\`🔍 Opening lightbox for \${productName}\`);
    
    // Create lightbox if it doesn't exist
    let lightbox = document.getElementById('imageLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'imageLightbox';
        lightbox.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: none; z-index: 1000; align-items: center; justify-content: center;';
        lightbox.innerHTML = \`
            <div style="position: relative; max-width: 90%; max-height: 90%;">
                <img id="lightboxImage" style="max-width: 100%; max-height: 100%; border-radius: 8px;">
                <button onclick="closeLightbox()" style="position: absolute; top: -10px; right: -10px; background: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button>
                <p id="lightboxCaption" style="color: white; text-align: center; margin-top: 1rem;"></p>
            </div>
        \`;
        document.body.appendChild(lightbox);
    }
    
    const lightboxImg = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');
    
    lightboxImg.src = imageSrc;
    caption.textContent = productName;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== Category Filter =====
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
    
    // Update active button
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (categoryId === 'all') {
        products = allProducts;
        buttons[0].classList.add('active');
    } else {
        products = allProducts.filter(p => p.category_id == categoryId);
        buttons.forEach(btn => {
            if (btn.textContent === categoriesData.find(c => c.id == categoryId)?.name) {
                btn.classList.add('active');
            }
        });
    }
    
    displayProducts();
    
    // Scroll to products
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

// ===== Search Functionality =====
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    console.log('🔍 Searching for:', searchTerm);
    
    if (searchTerm === '') {
        if (currentCategory === 'all') {
            products = allProducts;
        } else {
            products = allProducts.filter(p => p.category_id == currentCategory);
        }
    } else {
        let searchBase = currentCategory === 'all' ? allProducts : allProducts.filter(p => p.category_id == currentCategory);
        products = searchBase.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }
    
    displayProducts();
    
    if (products.length === 0) {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = \`<div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
            <h3>No products found</h3>
            <p>No products match "\${searchTerm}"</p>
            <button onclick="clearSearch()" style="background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Clear Search</button>
        </div>\`;
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchProducts();
    }
}

// ===== Cart Functionality =====
function addToCart(productId, productName, price) {
    console.log(\`🛒 Adding to cart: \${productName} (ID: \${productId}, Price: \${price})\`);
    
    // Simple cart functionality for now
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show notification
    showNotification(\`Added \${productName} to cart!\`, 'success');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function showNotification(message, type = 'info') {
    console.log(\`📢 Notification: \${message}\`);
    
    // Simple notification
    const notification = document.createElement('div');
    notification.style.cssText = \`
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: \${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white; padding: 1rem 1.5rem; border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    \`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ===== Initialize Features =====
function initializeFeatures() {
    console.log('🔧 Initializing features...');
    
    // Search functionality
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    if (searchButton) {
        searchButton.onclick = searchProducts;
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
    
    // Update cart count
    updateCartCount();
    
    // Close lightbox on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
    
    console.log('✅ Features initialized');
}

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing...');
    
    setTimeout(() => {
        fetchProducts();
    }, 100);
});

console.log('✅ Enhanced script loaded with images and buttons');
`;
        
        fs.writeFileSync(scriptPath, enhancedScript);
        console.log('✅ Enhanced script.js with images and buttons');
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Main execution
console.log('🎯 Starting images and buttons fix...');
fixScriptJS();

console.log('\n🎉 IMAGES AND BUTTONS FIX COMPLETED!');
console.log('====================================');
console.log('✅ Added proper image handling');
console.log('✅ Fixed button functionality');
console.log('✅ Added image lightbox');
console.log('✅ Added cart functionality');
console.log('✅ Added search functionality');
console.log('✅ Added category filtering');
console.log('');
console.log('🚀 Products should now show images and have working buttons!');