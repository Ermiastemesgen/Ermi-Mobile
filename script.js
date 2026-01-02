// AliExpress-Style JavaScript for Ermi Mobile - Enhanced with Mobile Responsiveness & Accessibility

// Global variables
let currentUser = null;
let cart = [];
let products = [];
let categories = [];
let settings = {};

// Touch and mobile support
let touchStartX = 0;
let touchStartY = 0;
let isTouch = false;

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
    setupAccessibility();
    setupTouchSupport();
    loadProducts();
    loadSettings();
    checkUserSession();
});

// Initialize application
function initializeApp() {
    console.log('Initializing AliExpress-style Ermi Mobile with enhanced mobile support...');
    
    // Detect touch device
    isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
        document.body.classList.add('touch-device');
    }
    
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
    
    // Setup lazy loading
    setupLazyLoading();
    
    // Setup performance monitoring
    trackPerformance();
}

// Enhanced accessibility setup
function setupAccessibility() {
    // Add skip link functionality
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.setAttribute('aria-label', 'Skip to main content');
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Enhance focus management
    setupFocusManagement();
    
    // Add ARIA labels and roles
    enhanceAriaAttributes();
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // Announce dynamic content changes
    setupLiveRegions();
}

function setupFocusManagement() {
    // Focus trap for modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const activeModal = document.querySelector('.modal-overlay.show');
            if (activeModal) {
                trapFocus(e, activeModal);
            }
        }
    });
    
    // Focus visible elements on mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            setTimeout(() => {
                const firstFocusable = document.querySelector('.mobile-menu .mobile-search-input');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, 300);
        });
    }
}

function trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
        }
    }
}

function enhanceAriaAttributes() {
    // Enhance search functionality
    if (searchInput) {
        searchInput.setAttribute('aria-label', 'Search products');
        searchInput.setAttribute('aria-describedby', 'search-help');
        
        // Add search help text
        const searchHelp = document.createElement('div');
        searchHelp.id = 'search-help';
        searchHelp.className = 'sr-only';
        searchHelp.textContent = 'Type to search products. Use arrow keys to navigate suggestions.';
        searchInput.parentNode.appendChild(searchHelp);
    }
    
    if (searchSuggestions) {
        searchSuggestions.setAttribute('role', 'listbox');
        searchSuggestions.setAttribute('aria-label', 'Search suggestions');
    }
    
    // Enhance cart section
    if (cartSection) {
        cartSection.setAttribute('aria-label', 'Shopping cart');
        cartSection.setAttribute('role', 'button');
    }
    
    // Enhance product grid
    if (productGrid) {
        productGrid.setAttribute('role', 'grid');
        productGrid.setAttribute('aria-label', 'Product catalog');
    }
    
    // Enhance navigation
    const categoryNav = document.querySelector('.category-nav');
    if (categoryNav) {
        categoryNav.setAttribute('role', 'navigation');
        categoryNav.setAttribute('aria-label', 'Product categories');
    }
}

function setupKeyboardNavigation() {
    // Arrow key navigation for search suggestions
    if (searchInput && searchSuggestions) {
        let selectedIndex = -1;
        
        searchInput.addEventListener('keydown', function(e) {
            const suggestions = searchSuggestions.querySelectorAll('.suggestion-item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
                updateSuggestionSelection(suggestions, selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSuggestionSelection(suggestions, selectedIndex);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                suggestions[selectedIndex].click();
            } else if (e.key === 'Escape') {
                hideSearchSuggestions();
                selectedIndex = -1;
            }
        });
    }
    
    // Category navigation with arrow keys
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach((item, index) => {
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');
        item.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const direction = e.key === 'ArrowRight' ? 1 : -1;
                const nextIndex = (index + direction + categoryItems.length) % categoryItems.length;
                
                categoryItems[index].setAttribute('tabindex', '-1');
                categoryItems[nextIndex].setAttribute('tabindex', '0');
                categoryItems[nextIndex].focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });
}

function updateSuggestionSelection(suggestions, selectedIndex) {
    suggestions.forEach((suggestion, index) => {
        suggestion.classList.toggle('selected', index === selectedIndex);
        suggestion.setAttribute('aria-selected', index === selectedIndex);
        if (index === selectedIndex) {
            suggestion.focus();
        }
    });
}

function setupLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
    
    // Create assertive live region for urgent announcements
    const assertiveLiveRegion = document.createElement('div');
    assertiveLiveRegion.id = 'assertive-live-region';
    assertiveLiveRegion.className = 'sr-only';
    assertiveLiveRegion.setAttribute('aria-live', 'assertive');
    assertiveLiveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(assertiveLiveRegion);
}

function announceToScreenReader(message, assertive = false) {
    const liveRegion = document.getElementById(assertive ? 'assertive-live-region' : 'live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Enhanced touch support
function setupTouchSupport() {
    if (!isTouch) return;
    
    // Add touch-friendly button sizes
    const style = document.createElement('style');
    style.textContent = `
        .touch-device button,
        .touch-device .action-btn,
        .touch-device .category-item,
        .touch-device .suggestion-item {
            min-height: 44px;
            min-width: 44px;
        }
        
        .touch-device .product-card {
            padding: 1rem;
        }
        
        .touch-device .add-to-cart-btn {
            padding: 1rem;
            font-size: 1.1rem;
        }
    `;
    document.head.appendChild(style);
    
    // Setup touch gestures
    setupTouchGestures();
    
    // Enhance mobile menu with swipe gestures
    setupMobileMenuGestures();
}

function setupTouchGestures() {
    // Swipe to close mobile menu
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.addEventListener('touchstart', handleTouchStart, { passive: true });
        mobileMenu.addEventListener('touchmove', handleTouchMove, { passive: false });
        mobileMenu.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // Product card touch enhancements
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.product-card')) {
            e.target.closest('.product-card').classList.add('touch-active');
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        const card = e.target.closest('.product-card');
        if (card) {
            card.classList.remove('touch-active');
        }
    }, { passive: true });
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Prevent vertical scrolling when swiping horizontally
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Swipe left to close menu (swipe distance > 50px)
    if (diffX < -50 && Math.abs(diffX) > Math.abs(diffY)) {
        closeMobileMenu();
    }
    
    touchStartX = 0;
    touchStartY = 0;
}

function setupMobileMenuGestures() {
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('touchstart', function(e) {
            if (e.target === mobileMenuOverlay) {
                touchStartX = e.touches[0].clientX;
            }
        }, { passive: true });
        
        mobileMenuOverlay.addEventListener('touchend', function(e) {
            if (e.target === mobileMenuOverlay) {
                const touchEndX = e.changedTouches[0].clientX;
                const diffX = touchStartX - touchEndX;
                
                // Swipe right on overlay to close menu
                if (diffX > 50) {
                    closeMobileMenu();
                }
            }
        }, { passive: true });
    }
}

// Setup event listeners with enhanced mobile support
function setupEventListeners() {
    // Search functionality with enhanced mobile support
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', showSearchSuggestions);
        searchInput.addEventListener('blur', hideSearchSuggestions);
        
        // Mobile-specific search enhancements
        if (isTouch) {
            searchInput.addEventListener('touchstart', function() {
                // Scroll search into view on mobile
                setTimeout(() => {
                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        }
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
        // Add touch feedback
        if (isTouch) {
            searchBtn.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            searchBtn.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        }
    }
    
    // User menu with enhanced accessibility
    if (userMenu) {
        userMenu.addEventListener('click', toggleUserDropdown);
        userMenu.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleUserDropdown();
            }
        });
    }
    
    // Mobile menu with enhanced touch support
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
        mobileMenuClose.setAttribute('aria-label', 'Close navigation menu');
    }
    
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });
    }
    
    // Category navigation with enhanced accessibility
    const categoryItems = document.querySelectorAll('.category-item, .mobile-category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProductsByCategory(category);
            updateActiveCategory(this);
            announceToScreenReader(`Showing ${category} products`);
        });
        
        // Add ARIA attributes
        item.setAttribute('role', 'button');
        item.setAttribute('aria-pressed', 'false');
    });
    
    // Sort functionality with accessibility
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
        sortSelect.setAttribute('aria-label', 'Sort products');
    }
    
    // View toggle with accessibility
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            toggleView(view);
            updateActiveViewBtn(this);
            announceToScreenReader(`Switched to ${view} view`);
        });
        btn.setAttribute('aria-pressed', 'false');
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
    
    // Hero CTA button with enhanced accessibility
    const heroCta = document.querySelector('.hero-cta-btn');
    if (heroCta) {
        heroCta.addEventListener('click', function() {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            announceToScreenReader('Navigated to products section');
        });
        heroCta.setAttribute('aria-label', 'Browse products');
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (userMenu && !userMenu.contains(e.target)) {
            hideUserDropdown();
        }
        
        if (searchInput && searchSuggestions && 
            !searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSearchSuggestions();
        }
    });
    
    // Enhanced keyboard shortcuts
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
                announceToScreenReader('Search focused');
            }
        }
        
        // Alt + M toggles mobile menu
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            toggleMobileMenu();
        }
    });
}

// Enhanced search functionality
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
    
    displaySearchSuggestions(suggestions, query);
}

function displaySearchSuggestions(suggestions, query) {
    if (!searchSuggestions) return;
    
    searchSuggestions.innerHTML = '';
    
    if (suggestions.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'suggestion-item no-results';
        noResults.textContent = 'No suggestions found';
        noResults.setAttribute('role', 'option');
        noResults.setAttribute('aria-selected', 'false');
        searchSuggestions.appendChild(noResults);
        return;
    }
    
    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        item.setAttribute('tabindex', '-1');
        
        // Highlight matching text
        const regex = new RegExp(`(${query})`, 'gi');
        const highlightedText = suggestion.replace(regex, '<mark>$1</mark>');
        item.innerHTML = highlightedText;
        
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
        searchInput.setAttribute('aria-expanded', 'true');
    }
}

function hideSearchSuggestions() {
    setTimeout(() => {
        if (searchSuggestions) {
            searchSuggestions.style.display = 'none';
            searchInput.setAttribute('aria-expanded', 'false');
        }
    }, 200);
}

function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        searchProducts(query);
        hideSearchSuggestions();
        announceToScreenReader(`Searching for ${query}`);
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
    announceToScreenReader(`Found ${filteredProducts.length} products for ${query}`);
}

// Enhanced user menu functionality
function toggleUserDropdown() {
    if (userDropdown) {
        const isOpen = userDropdown.classList.contains('show');
        userDropdown.classList.toggle('show');
        userMenu.setAttribute('aria-expanded', !isOpen);
        
        if (!isOpen) {
            // Focus first item when opening
            const firstItem = userDropdown.querySelector('.dropdown-item');
            if (firstItem) {
                setTimeout(() => firstItem.focus(), 100);
            }
        }
    }
}

function hideUserDropdown() {
    if (userDropdown) {
        userDropdown.classList.remove('show');
        userMenu.setAttribute('aria-expanded', 'false');
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

// Enhanced mobile menu functionality
function toggleMobileMenu() {
    if (mobileMenuOverlay) {
        const isOpen = mobileMenuOverlay.classList.contains('show');
        mobileMenuOverlay.classList.toggle('show');
        mobileMenuToggle.classList.toggle('active');
        mobileMenuToggle.setAttribute('aria-expanded', !isOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? '' : 'hidden';
        
        if (!isOpen) {
            announceToScreenReader('Navigation menu opened');
        } else {
            announceToScreenReader('Navigation menu closed');
        }
    }
}

function closeMobileMenu() {
    if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('show');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        announceToScreenReader('Navigation menu closed');
    }
}

// Enhanced product functionality with accessibility
async function loadProducts() {
    try {
        showProductSkeletons();
        announceToScreenReader('Loading products');
        
        const response = await fetch('/api/products');
        if (response.ok) {
            const data = await response.json();
            // Handle both direct array and {products: array} response formats
            products = Array.isArray(data) ? data : (data.products || []);
            displayProducts(products);
            updateResultsCount(products.length);
            announceToScreenReader(`Loaded ${products.length} products`);
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showProductError();
        announceToScreenReader('Error loading products', true);
    }
}

function showProductSkeletons() {
    if (!productGrid) return;
    
    // Create skeleton items if they don't exist
    const existingSkeletons = productGrid.querySelectorAll('.product-skeleton');
    if (existingSkeletons.length === 0) {
        for (let i = 0; i < 6; i++) {
            const skeleton = createProductSkeleton();
            productGrid.appendChild(skeleton);
        }
    }
    
    const skeletons = productGrid.querySelectorAll('.product-skeleton');
    skeletons.forEach(skeleton => {
        skeleton.style.display = 'block';
    });
}

function createProductSkeleton() {
    const skeleton = document.createElement('div');
    skeleton.className = 'product-skeleton';
    skeleton.setAttribute('aria-hidden', 'true');
    skeleton.innerHTML = `
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-rating"></div>
            <div class="skeleton-price"></div>
        </div>
    `;
    return skeleton;
}

function hideProductSkeletons() {
    const skeletons = productGrid.querySelectorAll('.product-skeleton');
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
    
    productsToShow.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productGrid.appendChild(productCard);
    });
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    card.setAttribute('role', 'gridcell');
    card.setAttribute('aria-label', `${product.name}, ${product.price} ETB`);
    card.setAttribute('tabindex', '0');
    
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
        starsHTML += '<i class="fas fa-star star" aria-hidden="true"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt star" aria-hidden="true"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star star empty" aria-hidden="true"></i>';
    }
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image || '/uploads/default-product.jpg'}" 
                 alt="${product.name}" 
                 loading="lazy"
                 onerror="this.src='/uploads/default-product.jpg'">
            ${discount > 0 ? `<div class="product-badge" aria-label="${discount}% discount">-${discount}%</div>` : ''}
            <div class="product-actions">
                <button class="action-btn" 
                        title="Quick View ${product.name}" 
                        aria-label="Quick view ${product.name}"
                        onclick="quickViewProduct(${product.id})">
                    <i class="fas fa-eye" aria-hidden="true"></i>
                </button>
                <button class="action-btn" 
                        title="Add ${product.name} to Wishlist" 
                        aria-label="Add to wishlist"
                        onclick="addToWishlist(${product.id})">
                    <i class="fas fa-heart" aria-hidden="true"></i>
                </button>
                <button class="action-btn" 
                        title="Compare ${product.name}" 
                        aria-label="Add to compare"
                        onclick="addToCompare(${product.id})">
                    <i class="fas fa-balance-scale" aria-hidden="true"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-rating" aria-label="Rating: ${rating} out of 5 stars">
                <div class="stars">${starsHTML}</div>
                <span class="rating-count" aria-label="${product.review_count || 0} reviews">(${product.review_count || 0})</span>
            </div>
            <div class="product-price">
                <span class="current-price" aria-label="Current price ${product.price} ETB">ETB ${product.price}</span>
                ${product.original_price && product.original_price > product.price ? 
                    `<span class="original-price" aria-label="Original price ${product.original_price} ETB">ETB ${product.original_price}</span>` : ''}
                ${discount > 0 ? `<span class="discount" aria-label="${discount}% discount">-${discount}%</span>` : ''}
            </div>
            <button class="add-to-cart-btn" 
                    onclick="addToCart(${product.id})"
                    aria-label="Add ${product.name} to cart">
                <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                Add to Cart
            </button>
        </div>
    `;
    
    // Enhanced keyboard support for product cards
    card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showProductDetails(product);
        }
    });
    
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
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    message.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;" aria-hidden="true"></i>
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
    error.setAttribute('role', 'alert');
    error.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--danger-color);">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;" aria-hidden="true"></i>
            <h3>Error loading products</h3>
            <p>Please try refreshing the page</p>
            <button onclick="loadProducts()" 
                    style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; border: none; border-radius: var(--radius-lg); cursor: pointer; font-size: 1rem;"
                    aria-label="Retry loading products">
                <i class="fas fa-redo" aria-hidden="true"></i> Retry
            </button>
        </div>
    `;
    
    productGrid.appendChild(error);
}

// Enhanced category filtering with accessibility
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
    // Remove active class and aria-pressed from all category items
    const categoryItems = document.querySelectorAll('.category-item, .mobile-category-item');
    categoryItems.forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
    });
    
    // Add active class and aria-pressed to clicked item
    activeItem.classList.add('active');
    activeItem.setAttribute('aria-pressed', 'true');
}

// Enhanced sorting functionality
function handleSort() {
    const sortValue = sortSelect.value;
    let sortedProducts = [...products];
    
    switch (sortValue) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            announceToScreenReader('Products sorted by price: low to high');
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            announceToScreenReader('Products sorted by price: high to low');
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            announceToScreenReader('Products sorted alphabetically');
            break;
        case 'rating':
            sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            announceToScreenReader('Products sorted by rating');
            break;
        default:
            announceToScreenReader('Products sorted by default order');
            break;
    }
    
    displayProducts(sortedProducts);
}

// Enhanced view toggle functionality
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
    viewBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-pressed', 'true');
}

function updateResultsCount(count, label = 'products') {
    if (resultsCount) {
        resultsCount.textContent = `${count} ${label} found`;
        resultsCount.setAttribute('aria-live', 'polite');
    }
}

// Enhanced cart functionality with accessibility
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showMessage('Product not found', 'error');
        announceToScreenReader('Error: Product not found', true);
        return;
    }
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        announceToScreenReader(`Increased ${product.name} quantity to ${existingItem.quantity}`);
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
        announceToScreenReader(`Added ${product.name} to cart`);
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showCartNotification(product.name);
}

function removeFromCart(productId) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        cart = cart.filter(item => item.productId !== productId);
        updateCartDisplay();
        saveCartToStorage();
        announceToScreenReader(`Removed ${item.name} from cart`);
    }
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
            announceToScreenReader(`Updated ${item.name} quantity to ${quantity}`);
        }
    }
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        cartCount.setAttribute('aria-label', `${totalItems} items in cart`);
    }
    
    if (cartTotal) {
        cartTotal.textContent = `ETB ${totalPrice.toFixed(2)}`;
        cartTotal.setAttribute('aria-label', `Cart total: ${totalPrice.toFixed(2)} ETB`);
    }
    
    // Update cart section accessibility
    if (cartSection) {
        cartSection.setAttribute('aria-label', `Shopping cart: ${totalItems} items, total ${totalPrice.toFixed(2)} ETB`);
    }
}

function saveCartToStorage() {
    localStorage.setItem('ermi_cart', JSON.stringify(cart));
}

function showCartNotification(productName) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <span>${productName} added to cart!</span>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Enhanced product actions with accessibility
function quickViewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Create quick view modal with enhanced accessibility
    const modal = document.createElement('div');
    modal.className = 'modal-overlay quick-view-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'quick-view-title');
    modal.innerHTML = `
        <div class="modal-content quick-view-content">
            <div class="modal-header">
                <h3 id="quick-view-title">Quick View: ${product.name}</h3>
                <button class="modal-close" aria-label="Close quick view">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="quick-view-grid">
                    <div class="quick-view-image">
                        <img src="${product.image || '/uploads/default-product.jpg'}" 
                             alt="${product.name}"
                             onerror="this.src='/uploads/default-product.jpg'">
                    </div>
                    <div class="quick-view-info">
                        <h4>${product.name}</h4>
                        <div class="product-rating" aria-label="Rating: ${product.rating || 4.5} out of 5 stars">
                            <div class="stars">${generateStars(product.rating || 4.5)}</div>
                            <span class="rating-count">(${product.review_count || 0})</span>
                        </div>
                        <div class="product-price">
                            <span class="current-price">ETB ${product.price}</span>
                            ${product.original_price && product.original_price > product.price ? 
                                `<span class="original-price">ETB ${product.original_price}</span>` : ''}
                        </div>
                        <p class="product-description">${product.description || 'High-quality mobile accessory.'}</p>
                        <button class="add-to-cart-btn" 
                                onclick="addToCart(${product.id}); closeQuickView();"
                                aria-label="Add ${product.name} to cart">
                            <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with focus management
    setTimeout(() => {
        modal.classList.add('show');
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }, 10);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => closeQuickView());
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeQuickView();
        }
    });
    
    // Keyboard support
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeQuickView();
        }
    });
    
    window.closeQuickView = function() {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 300);
        announceToScreenReader('Quick view closed');
    };
    
    announceToScreenReader(`Quick view opened for ${product.name}`);
}

function addToWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        showMessage(`${product.name} added to wishlist!`, 'success');
        announceToScreenReader(`${product.name} added to wishlist`);
    }
}

function addToCompare(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        showMessage(`${product.name} added to compare!`, 'success');
        announceToScreenReader(`${product.name} added to compare`);
    }
}

function showProductDetails(product) {
    // Enhanced product details with accessibility
    console.log('Show product details:', product);
    announceToScreenReader(`Viewing details for ${product.name}`);
}

// Utility functions
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star star" aria-hidden="true"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt star" aria-hidden="true"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star star empty" aria-hidden="true"></i>';
    }
    
    return starsHTML;
}

function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    messageEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
    messageEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    
    // Add to top of page
    document.body.insertBefore(messageEl, document.body.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 5000);
    
    // Announce to screen readers
    announceToScreenReader(message, type === 'error');
}

// Enhanced modal functionality with accessibility
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
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
        
        announceToScreenReader(`${type} modal opened`);
    }
}

function hideModal(type) {
    const modal = type === 'login' ? loginModal : registerModal;
    if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        announceToScreenReader(`${type} modal closed`);
    }
}

// Enhanced authentication with accessibility
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        announceToScreenReader('Logging in...');
        
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
        announceToScreenReader('Creating account...');
        
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

// Enhanced contact form with accessibility
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
        announceToScreenReader('Sending message...');
        
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
            
            // Focus the target for accessibility
            targetElement.focus();
            announceToScreenReader(`Navigated to ${targetElement.textContent || targetId}`);
        }
    }
});

// Enhanced lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loading');
                    
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        img.src = tempImg.src;
                        img.classList.remove('loading', 'lazy');
                        img.classList.add('loaded');
                    };
                    tempImg.onerror = () => {
                        img.classList.remove('loading', 'lazy');
                        img.classList.add('error');
                        img.src = '/uploads/default-product.jpg';
                    };
                    tempImg.src = img.dataset.src || img.src;
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }
}

// Performance monitoring
function trackPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            
            // Track Core Web Vitals
            if ('web-vital' in window) {
                // This would integrate with web-vitals library if available
            }
        });
    }
}

// Enhanced error handling with accessibility
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showMessage('An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showMessage('An unexpected error occurred. Please try again.', 'error');
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

console.log('AliExpress-style Ermi Mobile with enhanced mobile responsiveness and accessibility initialized successfully!');