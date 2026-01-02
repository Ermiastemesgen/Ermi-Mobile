
// ===== COMPLETE WORKING SCRIPT FOR ERMI MOBILE =====
const API_URL = window.location.origin + '/api';
console.log('🔗 API_URL:', API_URL);

// Global variables
let products = [];
let allProducts = [];
let categoriesData = [];
let currentCategory = 'all';
let currentUser = null;

// ===== FETCH PRODUCTS =====
async function fetchProducts() {
    console.log('🚀 fetchProducts started');
    
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('❌ productsGrid not found');
        return;
    }
    
    productsGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 2rem;"><h3>🔄 Loading Products...</h3></div>';
    
    try {
        console.log('📡 Fetching from:', API_URL + '/products');
        const response = await fetch(API_URL + '/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('📡 Products response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Products data received:', data);
        
        if (data && data.products && Array.isArray(data.products)) {
            products = data.products;
            allProducts = data.products;
            console.log(`✅ Loaded ${products.length} products`);
            displayProducts();
            loadCategories();
        } else {
            throw new Error('Invalid data structure: ' + JSON.stringify(data));
        }
        
    } catch (error) {
        console.error('❌ fetchProducts error:', error);
        productsGrid.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
                <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 1.5rem; max-width: 500px; margin: 0 auto;">
                    <h3 style="color: #dc2626;">Products Not Available</h3>
                    <p style="color: #7f1d1d;">Error: ${error.message}</p>
                    <button onclick="window.location.reload()" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
    }
}

// ===== DISPLAY PRODUCTS =====
function displayProducts() {
    console.log('🎨 displayProducts called');
    
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 2rem;"><h3>No products available</h3></div>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const imageSrc = getImageSrc(product.image);
        
        productCard.innerHTML = `
            <div class="product-image">
                ${imageSrc ? 
                    `<img src="${imageSrc}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;" onerror="this.style.display='none'">` : 
                    '<div style="width: 100%; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #666;">📦 No Image</div>'
                }
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.price} Birr</p>
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})" class="add-to-cart">
                    Add to Cart
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

function getImageSrc(image) {
    if (!image) return null;
    if (image.includes('cloudinary.com')) return image;
    if (image.startsWith('uploads/')) return '/' + image;
    if (image.startsWith('/uploads/')) return image;
    return '/uploads/' + image;
}

// ===== LOAD CATEGORIES =====
async function loadCategories() {
    try {
        const response = await fetch(API_URL + '/categories');
        if (response.ok) {
            const data = await response.json();
            if (data && data.categories) {
                categoriesData = data.categories;
                displayCategoryFilter(data.categories);
            }
        }
    } catch (error) {
        console.warn('Categories failed:', error.message);
    }
}

function displayCategoryFilter(categories) {
    const filterDiv = document.getElementById('categoryFilter');
    if (!filterDiv) return;
    
    filterDiv.innerHTML = '<button class="filter-btn active" onclick="filterByCategory(\'all\')">All</button>';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = category.name;
        button.onclick = () => filterByCategory(category.id);
        filterDiv.appendChild(button);
    });
}

function filterByCategory(categoryId) {
    currentCategory = categoryId;
    
    if (categoryId === 'all') {
        products = allProducts;
    } else {
        products = allProducts.filter(p => p.category_id == categoryId);
    }
    
    displayProducts();
}

// ===== CART FUNCTIONALITY =====
function addToCart(productId, productName, price) {
    console.log(`🛒 Adding to cart: ${productName}`);
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, name: productName, price: price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`Added ${productName} to cart!`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem; border-radius: 8px; z-index: 1000;';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// ===== LOGIN SYSTEM - FIXED VERSION =====
let loginModalCreated = false;

function initializeLoginSystem() {
    console.log('🔐 Initializing login system...');
    
    // Wait for DOM to be fully ready
    if (document.readyState !== 'complete') {
        setTimeout(initializeLoginSystem, 100);
        return;
    }
    
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    console.log('🔍 Login button found:', !!loginButton);
    console.log('🔍 Logout button found:', !!logoutButton);
    
    if (loginButton) {
        // Remove any existing event listeners
        loginButton.replaceWith(loginButton.cloneNode(true));
        const newLoginButton = document.getElementById('loginButton');
        
        // Add click event listener
        newLoginButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔐 Login button clicked!');
            openLoginModal();
        });
        
        // Also add onclick attribute as backup
        newLoginButton.onclick = function(e) {
            e.preventDefault();
            console.log('🔐 Login button onclick triggered!');
            openLoginModal();
        };
        
        console.log('✅ Login button event listeners added');
    } else {
        console.error('❌ Login button not found in DOM');
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔐 Logout button clicked!');
            logout();
        });
        console.log('✅ Logout button event listener added');
    }
    
    // Check if user is already logged in
    checkUserSession();
    
    // Create login modal
    createLoginModal();
}

function checkUserSession() {
    console.log('🔍 Checking user session...');
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('✅ User session found:', currentUser.email);
            updateUIForLoggedInUser();
        } catch (error) {
            console.log('⚠️  Invalid user session, clearing...');
            localStorage.removeItem('currentUser');
        }
    } else {
        console.log('ℹ️  No user session found');
    }
}

function updateUIForLoggedInUser() {
    console.log('🔄 Updating UI for logged in user...');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (loginButton && logoutButton) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'flex';
        
        const logoutText = logoutButton.querySelector('span');
        if (logoutText && currentUser) {
            logoutText.textContent = currentUser.name || currentUser.email || 'Logout';
        }
        console.log('✅ UI updated for logged in user');
    } else {
        console.error('❌ Login/Logout buttons not found for UI update');
    }
}

function updateUIForLoggedOutUser() {
    console.log('🔄 Updating UI for logged out user...');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (loginButton && logoutButton) {
        loginButton.style.display = 'flex';
        logoutButton.style.display = 'none';
        console.log('✅ UI updated for logged out user');
    } else {
        console.error('❌ Login/Logout buttons not found for UI update');
    }
}

function createLoginModal() {
    console.log('🔧 Creating login modal...');
    
    // Check if modal already exists
    if (document.getElementById('loginModal') || loginModalCreated) {
        console.log('ℹ️  Login modal already exists');
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
    loginModalCreated = true;
    console.log('✅ Login modal created successfully');
}

function openLoginModal() {
    console.log('🔐 Opening login modal...');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) emailInput.focus();
        }, 100);
        
        console.log('✅ Login modal opened');
    } else {
        console.error('❌ Login modal not found');
        // Try to create it again
        createLoginModal();
        setTimeout(openLoginModal, 100);
    }
}

function closeLoginModal() {
    console.log('🔐 Closing login modal...');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        clearLoginForms();
        console.log('✅ Login modal closed');
    }
}

function showSignupForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        console.log('✅ Switched to signup form');
    }
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        console.log('✅ Switched to login form');
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
        showNotification('Please fill in all fields');
        return;
    }
    
    try {
        console.log('📡 Sending login request to:', API_URL + '/login');
        const response = await fetch(API_URL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('📡 Login response status:', response.status);
        const data = await response.json();
        console.log('📡 Login response data:', data);
        
        if (response.ok && data.user) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUIForLoggedInUser();
            closeLoginModal();
            
            showNotification(`Welcome back, ${currentUser.name || currentUser.email}!`);
            console.log('✅ Login successful');
        } else {
            showNotification(data.message || 'Login failed');
            console.log('❌ Login failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification('Login failed. Please try again.');
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
        showNotification('Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters');
        return;
    }
    
    try {
        console.log('📡 Sending signup request to:', API_URL + '/register');
        const response = await fetch(API_URL + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });
        
        console.log('📡 Signup response status:', response.status);
        const data = await response.json();
        console.log('📡 Signup response data:', data);
        
        if (response.ok) {
            showNotification('Account created successfully! Please login.');
            showLoginForm();
            
            const loginEmail = document.getElementById('loginEmail');
            if (loginEmail) loginEmail.value = email;
            
            console.log('✅ Signup successful');
        } else {
            showNotification(data.message || 'Signup failed');
            console.log('❌ Signup failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Signup error:', error);
        showNotification('Signup failed. Please try again.');
    }
}

function logout() {
    console.log('🔐 Logging out...');
    
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    updateUIForLoggedOutUser();
    
    localStorage.removeItem('cart');
    updateCartCount();
    
    showNotification('Logged out successfully');
    console.log('✅ Logout successful');
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing everything...');
    
    // Initialize immediately
    initializeLoginSystem();
    updateCartCount();
    
    // Then fetch products
    setTimeout(() => {
        fetchProducts();
    }, 100);
});

// Additional initialization when window loads (backup)
window.addEventListener('load', function() {
    console.log('🚀 Window loaded, ensuring login system is initialized...');
    
    // Double-check login system initialization
    setTimeout(() => {
        const loginButton = document.getElementById('loginButton');
        if (loginButton && !loginButton.onclick && !loginButton.hasAttribute('data-initialized')) {
            console.log('🔧 Re-initializing login system...');
            initializeLoginSystem();
            loginButton.setAttribute('data-initialized', 'true');
        }
    }, 200);
});

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

// Make functions globally available for debugging
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.initializeLoginSystem = initializeLoginSystem;

console.log('✅ Complete script with fixed login button loaded');
