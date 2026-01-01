
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
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Data received:', data);
        
        if (data && data.products && Array.isArray(data.products)) {
            products = data.products;
            allProducts = data.products;
            console.log(`✅ Loaded ${products.length} products`);
            
            displayProducts();
            
            // Load categories
            try {
                const catResponse = await fetch(API_URL + '/categories');
                if (catResponse.ok) {
                    const catData = await catResponse.json();
                    if (catData && catData.categories) {
                        categoriesData = catData.categories;
                        displayCategoryFilter(catData.categories);
                        console.log(`✅ Loaded ${catData.categories.length} categories`);
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
        
        productsGrid.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
                <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 1.5rem; max-width: 500px; margin: 0 auto;">
                    <h3 style="color: #dc2626; margin: 0 0 1rem 0;">
                        <i class="fas fa-exclamation-triangle"></i> Products Not Available
                    </h3>
                    <p style="color: #7f1d1d; margin: 0 0 1rem 0;">
                        We're having trouble loading our products right now.
                    </p>
                    <p style="color: #7f1d1d; margin: 0 0 1.5rem 0; font-size: 14px;">
                        <strong>Error:</strong> ${error.message}
                    </p>
                    <button onclick="window.location.reload()" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-refresh"></i> Reload Page
                    </button>
                </div>
            </div>
        `;
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
        console.log(`🛍️  Rendering product ${index + 1}: ${product.name}`);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Get proper image source
        const imageSrc = getProductImageSrc(product);
        console.log(`🖼️  Product ${product.name} image: ${imageSrc}`);
        
        productCard.innerHTML = `
            <div class="product-image" onclick="openImageLightbox('${imageSrc || ''}', '${product.name}')" style="cursor: ${imageSrc ? 'zoom-in' : 'default'};">
                ${imageSrc ? 
                    `<img src="${imageSrc}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" onerror="handleImageError(this, '${product.name}')">` : 
                    `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #f0f0f0, #e0e0e0); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #666; border-radius: 8px; border: 2px dashed #ccc;">
                        <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                        <span style="font-size: 0.9rem;">No Image</span>
                    </div>`
                }
            </div>
            <div class="product-info" style="padding: 1rem;">
                <h3 class="product-name" style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #333;">${product.name}</h3>
                ${product.description ? `<p class="product-description" style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666; line-height: 1.4;">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>` : ''}
                <p class="product-price" style="margin: 0 0 1rem 0; font-size: 1.2rem; font-weight: bold; color: #2563eb;">${product.price ? product.price.toFixed(2) : '0.00'} <span style="font-size: 0.9rem;">Birr</span></p>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})" style="flex: 1; background: #2563eb; color: white; border: none; padding: 0.75rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    ${product.category_id ? `<button onclick="filterByCategory(${product.category_id})" style="background: #6b7280; color: white; border: none; padding: 0.75rem; border-radius: 6px; cursor: pointer;" title="View category">
                        <i class="fas fa-tag"></i>
                    </button>` : ''}
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    console.log(`✅ Displayed ${products.length} products`);
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
    console.log(`❌ Image failed to load for ${productName}`);
    img.style.display = 'none';
    
    // Replace with placeholder
    const placeholder = document.createElement('div');
    placeholder.style.cssText = 'width: 100%; height: 200px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6c757d; border-radius: 8px; border: 2px dashed #dee2e6;';
    placeholder.innerHTML = `
        <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
        <span style="font-size: 0.9rem;">Image Not Available</span>
    `;
    
    img.parentNode.appendChild(placeholder);
}

function openImageLightbox(imageSrc, productName) {
    if (!imageSrc) return;
    
    console.log(`🔍 Opening lightbox for ${productName}`);
    
    // Create lightbox if it doesn't exist
    let lightbox = document.getElementById('imageLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'imageLightbox';
        lightbox.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: none; z-index: 1000; align-items: center; justify-content: center;';
        lightbox.innerHTML = `
            <div style="position: relative; max-width: 90%; max-height: 90%;">
                <img id="lightboxImage" style="max-width: 100%; max-height: 100%; border-radius: 8px;">
                <button onclick="closeLightbox()" style="position: absolute; top: -10px; right: -10px; background: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button>
                <p id="lightboxCaption" style="color: white; text-align: center; margin-top: 1rem;"></p>
            </div>
        `;
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
    
    filterDiv.innerHTML = '<button class="filter-btn active" onclick="filterByCategory(\'all\')">All Products</button>';
    
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
        productsGrid.innerHTML = `<div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
            <h3>No products found</h3>
            <p>No products match "${searchTerm}"</p>
            <button onclick="clearSearch()" style="background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Clear Search</button>
        </div>`;
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
    console.log(`🛒 Adding to cart: ${productName} (ID: ${productId}, Price: ${price})`);
    
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
    showNotification(`Added ${productName} to cart!`, 'success');
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
    console.log(`📢 Notification: ${message}`);
    
    // Simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white; padding: 1rem 1.5rem; border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
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

// Initialize login system after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeLoginSystem();
    }, 200);
});

console.log('✅ Enhanced script loaded with images and buttons');


// ===== LOGIN SYSTEM =====
let currentUser = null;

// Initialize login system
function initializeLoginSystem() {
    console.log('🔐 Initializing login system...');
    
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (loginButton) {
        loginButton.addEventListener('click', openLoginModal);
        console.log('✅ Login button event listener added');
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
        console.log('✅ Logout button event listener added');
    }
    
    // Check if user is already logged in
    checkUserSession();
    
    // Create login modal if it doesn't exist
    createLoginModal();
}

function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedInUser();
            console.log('✅ User session restored:', currentUser.email);
        } catch (error) {
            console.log('⚠️  Invalid user session, clearing...');
            localStorage.removeItem('currentUser');
        }
    }
}

function updateUIForLoggedInUser() {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (loginButton && logoutButton) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'flex';
        
        // Update logout button text with user name
        const logoutText = logoutButton.querySelector('span');
        if (logoutText && currentUser) {
            logoutText.textContent = currentUser.name || currentUser.email || 'Logout';
        }
    }
}

function updateUIForLoggedOutUser() {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (loginButton && logoutButton) {
        loginButton.style.display = 'flex';
        logoutButton.style.display = 'none';
    }
}

function createLoginModal() {
    // Check if modal already exists
    if (document.getElementById('loginModal')) {
        return;
    }
    
    const modalHTML = `
        <div id="loginModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div class="modal-content" style="background: white; padding: 2rem; border-radius: 12px; max-width: 400px; width: 90%; position: relative;">
                <button class="close-modal" onclick="closeLoginModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                
                <div id="loginForm">
                    <h2 style="margin: 0 0 1.5rem 0; text-align: center; color: #333;">Login to Your Account</h2>
                    
                    <form onsubmit="handleLogin(event)">
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #555;">Email:</label>
                            <input type="email" id="loginEmail" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #555;">Password:</label>
                            <input type="password" id="loginPassword" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
                        </div>
                        
                        <button type="submit" style="width: 100%; background: #2563eb; color: white; border: none; padding: 0.75rem; border-radius: 6px; font-size: 16px; cursor: pointer; margin-bottom: 1rem;">
                            <i class="fas fa-sign-in-alt"></i> Login
                        </button>
                    </form>
                    
                    <div style="text-align: center; margin-top: 1rem;">
                        <p style="margin: 0 0 0.5rem 0; color: #666;">Don't have an account?</p>
                        <button onclick="showSignupForm()" style="background: #6b7280; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-user-plus"></i> Sign Up
                        </button>
                    </div>
                </div>
                
                <div id="signupForm" style="display: none;">
                    <h2 style="margin: 0 0 1.5rem 0; text-align: center; color: #333;">Create New Account</h2>
                    
                    <form onsubmit="handleSignup(event)">
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #555;">Full Name:</label>
                            <input type="text" id="signupName" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #555;">Email:</label>
                            <input type="email" id="signupEmail" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #555;">Phone:</label>
                            <input type="tel" id="signupPhone" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #555;">Password:</label>
                            <input type="password" id="signupPassword" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
                        </div>
                        
                        <button type="submit" style="width: 100%; background: #10b981; color: white; border: none; padding: 0.75rem; border-radius: 6px; font-size: 16px; cursor: pointer; margin-bottom: 1rem;">
                            <i class="fas fa-user-plus"></i> Create Account
                        </button>
                    </form>
                    
                    <div style="text-align: center; margin-top: 1rem;">
                        <button onclick="showLoginForm()" style="background: #6b7280; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-arrow-left"></i> Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Login modal created');
}

function openLoginModal() {
    console.log('🔐 Opening login modal...');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus on email input
        setTimeout(() => {
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) emailInput.focus();
        }, 100);
    }
}

function closeLoginModal() {
    console.log('🔐 Closing login modal...');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Clear form inputs
        clearLoginForms();
    }
}

function showSignupForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }
}

function clearLoginForms() {
    const inputs = ['loginEmail', 'loginPassword', 'signupName', 'signupEmail', 'signupPhone', 'signupPassword'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
}

async function handleLogin(event) {
    event.preventDefault();
    console.log('🔐 Handling login...');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_URL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.user) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUIForLoggedInUser();
            closeLoginModal();
            
            showNotification(`Welcome back, ${currentUser.name || currentUser.email}!`, 'success');
            console.log('✅ Login successful');
        } else {
            showNotification(data.message || 'Login failed', 'error');
            console.log('❌ Login failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    console.log('🔐 Handling signup...');
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    
    if (!name || !email || !phone || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_URL + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Account created successfully! Please login.', 'success');
            showLoginForm();
            
            // Pre-fill login email
            const loginEmail = document.getElementById('loginEmail');
            if (loginEmail) loginEmail.value = email;
            
            console.log('✅ Signup successful');
        } else {
            showNotification(data.message || 'Signup failed', 'error');
            console.log('❌ Signup failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Signup error:', error);
        showNotification('Signup failed. Please try again.', 'error');
    }
}

function logout() {
    console.log('🔐 Logging out...');
    
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    updateUIForLoggedOutUser();
    
    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();
    
    showNotification('Logged out successfully', 'success');
    console.log('✅ Logout successful');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('loginModal');
    if (modal && event.target === modal) {
        closeLoginModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLoginModal();
    }
});
