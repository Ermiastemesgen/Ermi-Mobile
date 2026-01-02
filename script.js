// AliExpress-Style JavaScript for Ermi Mobile

// Global variables
let currentUser = null;
let cart = [];
let products = [];
let categories = [];
let settings = {};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchSuggestions = document.getElementById('searchSuggestions');
const userMenu = document.getElementById('userMenu');
const userDropdown = document.getElementById('userDropdown');
const cartSection = document.getElementById('cartSection');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const productGrid = document.getElementById('productGrid');
const resultsCount = document.getElementById('resultsCount');
const sortSelect = document.getElementById('sortSelect');

// Modal elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProducts();
    loadSettings();
    checkUserSession();
});

// Initialize application
function initializeApp() {
    console.log('Initializing AliExpress-style Ermi Mobile...');
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('ermi_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
    
    // Load user session
    const savedUser = localStorage.getItem('ermi_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserDisplay();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', showSearchSuggestions);
        searchInput.addEventListener('blur', hideSearchSuggestions);
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // User menu
    if (userMenu) {
        userMenu.addEventListener('click', toggleUserDropdown);
    }
    
    // Mobile menu
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });
    }
    
    // Category navigation
    const categoryItems = document.querySelectorAll('.category-item, .mobile-category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProductsByCategory(category);
            updateActiveCategory(this);
        });
    });
    
    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // View toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            toggleView(view);
            updateActiveViewBtn(this);
        });
    });
    
    // Modal functionality
    setupModalEventListeners();
    
    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Hero CTA button
    const heroCta = document.querySelector('.hero-cta-btn');
    if (heroCta) {
        heroCta.addEventListener('click', function() {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!userMenu.contains(e.target)) {
            hideUserDropdown();
        }
        
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSearchSuggestions();
        }
    });
}

// Search functionality
function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    if (query.length > 2) {
        showSearchSuggestions();
        generateSearchSuggestions(query);
    } else {
        hideSearchSuggestions();
    }
}

function generateSearchSuggestions(query) {
    const suggestions = products
        .filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
        .map(product => product.name);
    
    displaySearchSuggestions(suggestions);
}

function displaySearchSuggestions(suggestions) {
    if (!searchSuggestions) return;
    
    searchSuggestions.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', function() {
            searchInput.value = suggestion;
            handleSearch();
            hideSearchSuggestions();
        });
        searchSuggestions.appendChild(item);
    });
}

function showSearchSuggestions() {
    if (searchSuggestions) {
        searchSuggestions.style.display = 'block';
    }
}

function hideSearchSuggestions() {
    setTimeout(() => {
        if (searchSuggestions) {
            searchSuggestions.style.display = 'none';
        }
    }, 200);
}

function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        searchProducts(query);
        hideSearchSuggestions();
    }
}

function searchProducts(query) {
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    displayProducts(filteredProducts);
    updateResultsCount(filteredProducts.length, `Search results for "${query}"`);
}

// User menu functionality
function toggleUserDropdown() {
    if (userDropdown) {
        userDropdown.classList.toggle('show');
    }
}

function hideUserDropdown() {
    if (userDropdown) {
        userDropdown.classList.remove('show');
    }
}

function updateUserDisplay() {
    const loginItem = document.getElementById('loginItem');
    const registerItem = document.getElementById('registerItem');
    const profileItem = document.getElementById('profileItem');
    const ordersItem = document.getElementById('ordersItem');
    const logoutItem = document.getElementById('logoutItem');
    const userText = document.querySelector('.user-text');
    
    if (currentUser) {
        // User is logged in
        if (loginItem) loginItem.style.display = 'none';
        if (registerItem) registerItem.style.display = 'none';
        if (profileItem) profileItem.style.display = 'block';
        if (ordersItem) ordersItem.style.display = 'block';
        if (logoutItem) logoutItem.style.display = 'block';
        if (userText) userText.textContent = currentUser.name || 'Account';
        
        // Setup logout functionality
        if (logoutItem) {
            logoutItem.addEventListener('click', handleLogout);
        }
    } else {
        // User is not logged in
        if (loginItem) loginItem.style.display = 'block';
        if (registerItem) registerItem.style.display = 'block';
        if (profileItem) profileItem.style.display = 'none';
        if (ordersItem) ordersItem.style.display = 'none';
        if (logoutItem) logoutItem.style.display = 'none';
        if (userText) userText.textContent = 'Account';
        
        // Setup login/register functionality
        if (loginItem) {
            loginItem.addEventListener('click', () => showModal('login'));
        }
        if (registerItem) {
            registerItem.addEventListener('click', () => showModal('register'));
        }
    }
}

// Mobile menu functionality
function toggleMobileMenu() {
    if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.toggle('show');
        mobileMenuToggle.classList.toggle('active');
    }
}

function closeMobileMenu() {
    if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('show');
        mobileMenuToggle.classList.remove('active');
    }
}

// Product functionality
async function loadProducts() {
    try {
        showProductSkeletons();
        
        const response = await fetch('/api/products');
        if (response.ok) {
            const data = await response.json();
            // Handle both direct array and {products: array} formats
            products = data.products || data;
            displayProducts(products);
            updateResultsCount(products.length);
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showProductError();
    }
}

function showProductSkeletons() {
    // Skeleton loading is already in HTML, just ensure it's visible
    const skeletons = document.querySelectorAll('.product-skeleton');
    skeletons.forEach(skeleton => {
        skeleton.style.display = 'block';
    });
}

function hideProductSkeletons() {
    const skeletons = document.querySelectorAll('.product-skeleton');
    skeletons.forEach(skeleton => {
        skeleton.style.display = 'none';
    });
}

function displayProducts(productsToShow) {
    if (!productGrid) return;
    
    hideProductSkeletons();
    
    // Clear existing products (except skeletons)
    const existingProducts = productGrid.querySelectorAll('.product-card:not(.product-skeleton)');
    existingProducts.forEach(product => product.remove());
    
    if (productsToShow.length === 0) {
        showNoProductsMessage();
        return;
    }
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    
    // Calculate discount percentage
    const discount = product.original_price && product.price < product.original_price 
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0;
    
    // Generate star rating
    const rating = product.rating || 4.5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star star"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt star"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star star empty"></i>';
    }
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image || '/uploads/default-product.jpg'}" alt="${product.name}" loading="lazy">
            ${discount > 0 ? `<div class="product-badge">-${discount}%</div>` : ''}
            <div class="product-actions">
                <button class="action-btn" title="Quick View" onclick="quickViewProduct(${product.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" title="Add to Wishlist" onclick="addToWishlist(${product.id})">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn" title="Compare" onclick="addToCompare(${product.id})">
                    <i class="fas fa-balance-scale"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-rating">
                <div class="stars">${starsHTML}</div>
                <span class="rating-count">(${product.review_count || 0})</span>
            </div>
            <div class="product-price">
                <span class="current-price">ETB ${product.price}</span>
                ${product.original_price && product.original_price > product.price ? 
                    `<span class="original-price">ETB ${product.original_price}</span>` : ''}
                ${discount > 0 ? `<span class="discount">-${discount}%</span>` : ''}
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i>
                Add to Cart
            </button>
        </div>
    `;
    
    // Add click event for product details
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.product-actions') && !e.target.closest('.add-to-cart-btn')) {
            showProductDetails(product);
        }
    });
    
    return card;
}

function showNoProductsMessage() {
    if (!productGrid) return;
    
    const message = document.createElement('div');
    message.className = 'no-products-message';
    message.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
        </div>
    `;
    
    productGrid.appendChild(message);
}

function showProductError() {
    if (!productGrid) return;
    
    hideProductSkeletons();
    
    const error = document.createElement('div');
    error.className = 'product-error';
    error.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--danger);">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Error loading products</h3>
            <p>Please try refreshing the page</p>
            <button onclick="loadProducts()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
    
    productGrid.appendChild(error);
}

// Category filtering
function filterProductsByCategory(category) {
    let filteredProducts;
    
    if (category === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    displayProducts(filteredProducts);
    updateResultsCount(filteredProducts.length, `${category.charAt(0).toUpperCase() + category.slice(1)} products`);
}

function updateActiveCategory(activeItem) {
    // Remove active class from all category items
    const categoryItems = document.querySelectorAll('.category-item, .mobile-category-item');
    categoryItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to clicked item
    activeItem.classList.add('active');
}

// Sorting functionality
function handleSort() {
    const sortValue = sortSelect.value;
    let sortedProducts = [...products];
    
    switch (sortValue) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        default:
            // Default sorting (by ID or original order)
            break;
    }
    
    displayProducts(sortedProducts);
}

// View toggle functionality
function toggleView(view) {
    if (!productGrid) return;
    
    if (view === 'list') {
        productGrid.classList.add('list-view');
    } else {
        productGrid.classList.remove('list-view');
    }
}

function updateActiveViewBtn(activeBtn) {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function updateResultsCount(count, label = 'products') {
    if (resultsCount) {
        resultsCount.textContent = `${count} ${label} found`;
    }
}
// Cart functionality
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showMessage('Product not found', 'error');
        return;
    }
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showCartNotification(product.name);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartDisplay();
    saveCartToStorage();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    if (cartTotal) {
        cartTotal.textContent = `ETB ${totalPrice}`;
    }
}

function saveCartToStorage() {
    localStorage.setItem('ermi_cart', JSON.stringify(cart));
}

function showCartNotification(productName) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${productName} added to cart!</span>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: 0 4px 20px var(--shadow);
        z-index: 4000;
        transform: translateX(100%);
        transition: transform var(--transition-normal);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Product actions
function quickViewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Create quick view modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay quick-view-modal';
    modal.innerHTML = `
        <div class="modal-content quick-view-content">
            <div class="modal-header">
                <h3>Quick View</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="quick-view-grid">
                    <div class="quick-view-image">
                        <img src="${product.image || '/uploads/default-product.jpg'}" alt="${product.name}">
                    </div>
                    <div class="quick-view-info">
                        <h4>${product.name}</h4>
                        <div class="product-rating">
                            <div class="stars">${generateStars(product.rating || 4.5)}</div>
                            <span class="rating-count">(${product.review_count || 0})</span>
                        </div>
                        <div class="product-price">
                            <span class="current-price">ETB ${product.price}</span>
                            ${product.original_price && product.original_price > product.price ? 
                                `<span class="original-price">ETB ${product.original_price}</span>` : ''}
                        </div>
                        <p class="product-description">${product.description || 'High-quality mobile accessory.'}</p>
                        <button class="add-to-cart-btn" onclick="addToCart(${product.id}); closeQuickView();">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        opacity: 0;
        visibility: hidden;
        transition: all var(--transition-normal);
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
    }, 10);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => closeQuickView());
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeQuickView();
        }
    });
    
    window.closeQuickView = function() {
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    };
}

function addToWishlist(productId) {
    // Placeholder for wishlist functionality
    showMessage('Added to wishlist!', 'success');
}

function addToCompare(productId) {
    // Placeholder for compare functionality
    showMessage('Added to compare!', 'success');
}

function showProductDetails(product) {
    // Placeholder for product details page
    console.log('Show product details:', product);
}

// Utility functions
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star star"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt star"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star star empty"></i>';
    }
    
    return starsHTML;
}

function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    // Add to top of page
    document.body.insertBefore(messageEl, document.body.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

// Modal functionality
function setupModalEventListeners() {
    // Login modal
    const loginItem = document.getElementById('loginItem');
    const registerItem = document.getElementById('registerItem');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (loginItem) loginItem.addEventListener('click', () => showModal('login'));
    if (registerItem) registerItem.addEventListener('click', () => showModal('register'));
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => showModal('login'));
    if (mobileRegisterBtn) mobileRegisterBtn.addEventListener('click', () => showModal('register'));
    if (showRegister) showRegister.addEventListener('click', () => showModal('register'));
    if (showLogin) showLogin.addEventListener('click', () => showModal('login'));
    
    // Modal close buttons
    const loginModalClose = document.getElementById('loginModalClose');
    const registerModalClose = document.getElementById('registerModalClose');
    
    if (loginModalClose) loginModalClose.addEventListener('click', () => hideModal('login'));
    if (registerModalClose) registerModalClose.addEventListener('click', () => hideModal('register'));
    
    // Close modals when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) hideModal('login');
        });
    }
    
    if (registerModal) {
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) hideModal('register');
        });
    }
}

function showModal(type) {
    const modal = type === 'login' ? loginModal : registerModal;
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(type) {
    const modal = type === 'login' ? loginModal : registerModal;
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('ermi_user', JSON.stringify(currentUser));
            updateUserDisplay();
            hideModal('login');
            showMessage('Login successful!', 'success');
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            hideModal('register');
            showModal('login');
        } else {
            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('ermi_user');
    updateUserDisplay();
    hideUserDropdown();
    showMessage('Logged out successfully', 'success');
}

function checkUserSession() {
    // Check if user is logged in and update display
    updateUserDisplay();
}

// Settings and about
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            settings = await response.json();
            updateAboutText();
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function updateAboutText() {
    const aboutText = document.getElementById('aboutText');
    if (aboutText && settings.about_text) {
        aboutText.textContent = settings.about_text;
    }
}

// Contact form
async function handleContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !message) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });
        
        if (response.ok) {
            showMessage('Message sent successfully!', 'success');
            document.getElementById('contactForm').reset();
        } else {
            showMessage('Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showMessage('Failed to send message. Please try again.', 'error');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key closes modals and dropdowns
    if (e.key === 'Escape') {
        hideModal('login');
        hideModal('register');
        hideUserDropdown();
        hideSearchSuggestions();
        closeMobileMenu();
    }
    
    // Ctrl/Cmd + K focuses search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Performance monitoring
function trackPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        });
    }
}

// Initialize performance tracking
trackPerformance();

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send error reports to analytics service
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // Could send error reports to analytics service
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

console.log('AliExpress-style Ermi Mobile initialized successfully!');