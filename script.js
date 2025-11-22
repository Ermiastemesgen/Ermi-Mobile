// ===== API Configuration =====
// Automatically detect if running locally or on production
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`;

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
}

// Theme toggle handler
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
        
        // Show notification
        showNotification(
            currentTheme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled',
            'success'
        );
    });
}

// ===== Product Data =====
let products = [];

// ===== Shopping Cart =====
let cart = [];

// ===== User Authentication =====
let isLoggedIn = false;
let currentUser = null;

// ===== Site Settings =====
let siteSettings = {};

// ===== Get Cart Key for Current User =====
function getCartKey() {
    if (currentUser && currentUser.id) {
        return 'cart_user_' + currentUser.id;
    }
    return 'cart_guest';
}

// ===== Load Cart from Storage =====
function loadCart() {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    console.log('Loading cart with key:', cartKey);
    if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log('Cart loaded:', cart);
    } else {
        cart = [];
        console.log('No saved cart, starting empty');
    }
    updateCart();
}

// ===== Save Cart to Storage =====
function saveCart() {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

// ===== Cart Storage Key =====
function getCartKey() {
    if (currentUser && currentUser.id) {
        return `cart_user_${currentUser.id}`;
    }
    return 'cart_guest';
}

// ===== DOM Elements =====
const productsGrid = document.getElementById('productsGrid');
const cartIcon = document.getElementById('cartIcon');
const cartPopup = document.getElementById('cartPopup');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const loginButton = document.getElementById('loginButton');
const loginModal = document.getElementById('loginModal');
const loginOverlay = document.getElementById('loginOverlay');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const signupLink = document.getElementById('signupLink');
const signupModal = document.getElementById('signupModal');
const closeSignupModal = document.getElementById('closeSignupModal');
const signupForm = document.getElementById('signupForm');
const loginLink = document.getElementById('loginLink');

// ===== Fetch Products from Server =====
let allProducts = [];
let currentCategory = 'all';

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        products = data.products;
        allProducts = data.products;
        
        // Load categories for filter
        const categoriesResponse = await fetch(`${API_URL}/categories`);
        const catData = await categoriesResponse.json();
        categoriesData = catData.categories;
        displayCategoryFilter(catData.categories);
        
        displayProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Error loading products. Please refresh the page.', 'error');
    }
}

function displayCategoryFilter(categories) {
    const filterDiv = document.getElementById('categoryFilter');
    filterDiv.innerHTML = '<button class="filter-btn active" data-category="all" onclick="filterByCategory(\'all\')">All Products</button>';
    
    // Build hierarchical category buttons
    const buildCategoryButtons = (parentId = null, level = 0) => {
        categories
            .filter(cat => cat.parent_id === parentId)
            .forEach(cat => {
                const hasChildren = categories.some(c => c.parent_id === cat.id);
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.category = cat.id;
                btn.dataset.level = level;
                btn.dataset.hasChildren = hasChildren;
                
                // Add arrow for expandable categories
                const arrow = hasChildren ? '<span class="cat-arrow" id="arrow-' + cat.id + '">▶</span> ' : '';
                
                // Add category image if available
                const categoryImage = cat.image ? '<img src="' + cat.image + '" class="cat-image" alt="' + cat.name + '"> ' : '';
                
                btn.innerHTML = arrow + categoryImage + cat.name;
                
                // Click handler
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (hasChildren && e.target.classList.contains('cat-arrow')) {
                        toggleCategoryChildren(cat.id);
                    } else {
                        filterByCategory(cat.id);
                    }
                };
                
                // Make arrow clickable separately
                if (hasChildren) {
                    btn.addEventListener('click', (e) => {
                        if (e.target.classList.contains('cat-arrow')) {
                            e.stopPropagation();
                            toggleCategoryChildren(cat.id);
                        }
                    });
                }
                
                filterDiv.appendChild(btn);
                buildCategoryButtons(cat.id, level + 1);
            });
    };
    
    buildCategoryButtons();
}

let categoriesData = [];

function toggleCategoryChildren(catId) {
    const arrow = document.getElementById('arrow-' + catId);
    if (!arrow) return;
    
    const isExpanded = arrow.textContent === '▼';
    arrow.textContent = isExpanded ? '▶' : '▼';
    
    // Find all child categories
    const childCategories = categoriesData.filter(c => c.parent_id == catId);
    
    childCategories.forEach(child => {
        const childBtn = document.querySelector(`[data-category="${child.id}"]`);
        if (childBtn) {
            childBtn.style.display = isExpanded ? 'none' : 'inline-block';
            
            // Collapse nested children
            if (isExpanded) {
                const childArrow = document.getElementById('arrow-' + child.id);
                if (childArrow) {
                    childArrow.textContent = '▶';
                }
                // Hide all descendants
                hideDescendants(child.id);
            }
        }
    });
}

function hideDescendants(parentId) {
    const descendants = categoriesData.filter(c => c.parent_id == parentId);
    descendants.forEach(desc => {
        const descBtn = document.querySelector(`[data-category="${desc.id}"]`);
        if (descBtn) {
            descBtn.style.display = 'none';
            hideDescendants(desc.id);
        }
    });
}

function filterByCategory(categoryId) {
    // Handle null or undefined category
    if (categoryId === null || categoryId === 'null' || categoryId === undefined) {
        categoryId = 'all';
    }
    
    currentCategory = categoryId;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category == categoryId) {
            btn.classList.add('active');
        }
    });
    
    // Filter products
    if (categoryId === 'all') {
        products = allProducts;
    } else {
        products = allProducts.filter(p => p.category_id == categoryId);
    }
    
    displayProducts();
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Search Products =====
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // If search is empty, show all products or current category
        if (currentCategory === 'all') {
            products = allProducts;
        } else {
            products = allProducts.filter(p => p.category_id == currentCategory);
        }
    } else {
        // Search in product names
        let searchBase = currentCategory === 'all' ? allProducts : allProducts.filter(p => p.category_id == currentCategory);
        products = searchBase.filter(product => 
            product.name.toLowerCase().includes(searchTerm)
        );
    }
    
    displayProducts();
    
    // Show message if no results
    if (products.length === 0) {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem; color: #6b7280;">No products found matching "' + searchTerm + '"</p>';
    }
}

// ===== Initialize Products =====
function displayProducts() {
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Loading products...</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image" ${product.image ? 'onclick="openLightbox(\'' + product.image + '\', \'' + product.name + '\')" style="cursor: zoom-in;"' : 'onclick="filterByCategory(' + (product.category_id || 'null') + ')" style="cursor: pointer;"'} title="${product.image ? 'Click to view full size' : 'View ' + (product.category_name || 'all products')}">
                ${product.image ? 
                    '<img src="' + product.image + '" alt="' + product.name + '" style="width: 100%; height: 100%; object-fit: cover; image-rendering: high-quality;">' : 
                    '<i class="fas ' + product.icon + '"></i>'
                }
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                ${product.description ? '<p class="product-description">' + product.description + '</p>' : ''}
                <p class="product-price">${product.price.toFixed(2)} Birr</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// ===== Image Lightbox Functions =====
function openLightbox(imageSrc, productName) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');
    
    lightbox.style.display = 'block';
    lightboxImg.src = imageSrc;
    caption.textContent = productName;
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close lightbox when clicking outside the image
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('imageLightbox');
    const closeBtn = document.querySelector('.lightbox-close');
    
    if (closeBtn) {
        closeBtn.onclick = closeLightbox;
    }
    
    if (lightbox) {
        lightbox.onclick = function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        };
    }
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
});

// ===== Add to Cart Function =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        saveCart();
        updateCart();
        showNotification('Product added to cart!');
    }
}

// ===== Remove from Cart Function =====
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
}

// ===== Update Cart Display =====
function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    } else {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} Birr x ${item.quantity}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    // Update total price
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total.toFixed(2)} Birr`;
}

// ===== Show Notification =====
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#ef4444' : '#10b981';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== Cart Toggle Functions =====
function openCart() {
    cartPopup.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartPopup() {
    cartPopup.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== Mobile Menu Toggle =====
function toggleMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// ===== Smooth Scroll for Navigation Links =====
function smoothScroll(e) {
    if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        }
    }
}

// ===== Contact Form Submission =====
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if (!name || !email || !message) {
        formMessage.textContent = 'Please fill in all fields.';
        formMessage.className = 'form-message error';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (response.ok) {
            formMessage.textContent = data.message;
            formMessage.className = 'form-message success';
            contactForm.reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        } else {
            formMessage.textContent = data.error || 'Error sending message';
            formMessage.className = 'form-message error';
        }
    } catch (error) {
        console.error('Contact form error:', error);
        formMessage.textContent = 'Server error. Please try again.';
        formMessage.className = 'form-message error';
    }
}

// ===== Event Listeners =====
cartIcon.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartPopup);
cartOverlay.addEventListener('click', closeCartPopup);
hamburger.addEventListener('click', toggleMenu);
navMenu.addEventListener('click', smoothScroll);
contactForm.addEventListener('submit', handleFormSubmit);

// Search functionality
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');

searchButton.addEventListener('click', searchProducts);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        if (navMenu.classList.contains('active')) {
            toggleMenu();
        }
    }
});

// ===== Checkout Button =====
document.querySelector('.checkout-button').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    openCheckoutModal();
});

// ===== Checkout Modal Functions =====
function openCheckoutModal() {
    const checkoutModal = document.getElementById('checkoutModal');
    const loginOverlay = document.getElementById('loginOverlay');
    const checkoutSummary = document.getElementById('checkoutSummary');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    // Display order summary
    checkoutSummary.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
            <span>${item.name} x ${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)} Birr</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = total.toFixed(2) + ' Birr';
    
    checkoutModal.classList.add('active');
    loginOverlay.classList.add('active');
    closeCartPopup();
}

function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkoutModal');
    const loginOverlay = document.getElementById('loginOverlay');
    checkoutModal.classList.remove('active');
    loginOverlay.classList.remove('active');
    document.getElementById('checkoutForm').reset();
    // Reset to step 1
    document.getElementById('checkoutStep1').style.display = 'block';
    document.getElementById('checkoutForm').style.display = 'none';
}

// ===== Payment Method Continue Button =====
document.getElementById('continueToPayment').addEventListener('click', () => {
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;
    showPaymentInfo(selectedPayment);
    
    // Show step 2
    document.getElementById('checkoutStep1').style.display = 'none';
    document.getElementById('checkoutForm').style.display = 'block';
});

// ===== Back to Payment Method =====
document.getElementById('backToPaymentMethod').addEventListener('click', () => {
    document.getElementById('checkoutStep1').style.display = 'block';
    document.getElementById('checkoutForm').style.display = 'none';
});

// ===== Show Payment Information =====
function showPaymentInfo(paymentMethod) {
    const paymentInfo = document.getElementById('paymentInfo');
    
    console.log('Site Settings:', siteSettings);
    console.log('Telebirr Instructions:', siteSettings.telebirr_instructions);
    console.log('CBE Instructions:', siteSettings.cbe_instructions);
    console.log('Bank Instructions:', siteSettings.bank_instructions);
    
    // Get instructions with proper fallback
    const telebirrInstructions = (siteSettings.telebirr_instructions !== undefined && siteSettings.telebirr_instructions !== null && siteSettings.telebirr_instructions !== '') 
        ? siteSettings.telebirr_instructions 
        : 'Please transfer the total amount and keep your transaction reference number.';
    
    const cbeInstructions = (siteSettings.cbe_instructions !== undefined && siteSettings.cbe_instructions !== null && siteSettings.cbe_instructions !== '') 
        ? siteSettings.cbe_instructions 
        : 'Transfer the amount via CBE Birr and save your receipt.';
    
    const bankInstructions = (siteSettings.bank_instructions !== undefined && siteSettings.bank_instructions !== null && siteSettings.bank_instructions !== '') 
        ? siteSettings.bank_instructions 
        : 'Please transfer the total amount and keep your transaction slip.';
    
    console.log('Using Telebirr Instructions:', telebirrInstructions);
    console.log('Using CBE Instructions:', cbeInstructions);
    console.log('Using Bank Instructions:', bankInstructions);
    
    const paymentDetails = {
        telebirr: {
            icon: '📱',
            title: 'Telebirr Payment',
            info: `<strong>Account Name:</strong> ${siteSettings.telebirr_name || 'Ermi Mobile Shop'}<br><strong>Phone Number:</strong> ${siteSettings.telebirr_phone || '+251 911 234 567'}<br><br>${telebirrInstructions}`,
            color: '#f59e0b'
        },
        cbe: {
            icon: '🏦',
            title: 'CBE Birr Payment',
            info: `<strong>Account Name:</strong> ${siteSettings.cbe_name || 'Ermi Mobile Trading'}<br><strong>Account Number:</strong> ${siteSettings.cbe_account || '1000123456789'}<br><br>${cbeInstructions}`,
            color: '#3b82f6'
        },
        bank: {
            icon: '💳',
            title: 'Bank Transfer',
            info: `<strong>Bank:</strong> ${siteSettings.bank_name || 'Commercial Bank of Ethiopia'}<br><strong>Account Name:</strong> ${siteSettings.bank_account_name || 'Ermi Mobile Trading PLC'}<br><strong>Account Number:</strong> ${siteSettings.bank_account_number || '1000987654321'}<br><br>${bankInstructions}`,
            color: '#8b5cf6'
        }
    };
    
    const details = paymentDetails[paymentMethod];
    paymentInfo.style.borderColor = details.color;
    paymentInfo.innerHTML = `
        <div style="display: flex; align-items: start; gap: 1rem;">
            <div style="font-size: 2.5rem;">${details.icon}</div>
            <div style="flex: 1;">
                <h4 style="margin: 0 0 0.5rem 0; color: ${details.color}; font-size: 1.1rem;">${details.title}</h4>
                <p style="margin: 0; line-height: 1.6; color: #374151; font-size: 0.9rem;">${details.info}</p>
            </div>
        </div>
    `;
}

// ===== Payment Receipt Preview =====
document.getElementById('paymentReceipt').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('receiptPreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div style="border: 2px solid #10b981; border-radius: 8px; padding: 0.5rem; background: #f0fdf4;">
                    <p style="margin: 0 0 0.5rem 0; color: #065f46; font-weight: 600;">
                        <i class="fas fa-check-circle"></i> Receipt uploaded successfully
                    </p>
                    <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 5px; display: block;">
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #666;">
                        ${file.name} (${(file.size / 1024).toFixed(2)} KB)
                    </p>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
});

// ===== Checkout Form Submission =====
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Collect address fields
    const addressLine = document.getElementById('addressLine').value;
    const city = document.getElementById('city').value;
    const town = document.getElementById('town').value;
    const postalCode = document.getElementById('postalCode').value;
    
    // Combine address fields
    const deliveryAddress = `${addressLine}, ${town}, ${city}${postalCode ? ', ' + postalCode : ''}`;
    
    const phoneNumber = document.getElementById('phoneNumber').value;
    const receiptFile = document.getElementById('paymentReceipt').files[0];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (!receiptFile) {
        showNotification('Please upload payment receipt', 'error');
        return;
    }
    
    try {
        // First create the order
        const orderResponse = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser ? currentUser.id : null,
                items: cart,
                total: total,
                paymentMethod: paymentMethod,
                deliveryAddress: deliveryAddress,
                phoneNumber: phoneNumber
            })
        });

        const orderData = await orderResponse.json();

        if (orderResponse.ok) {
            // Upload payment receipt
            const formData = new FormData();
            formData.append('receipt', receiptFile);
            
            const uploadResponse = await fetch(`${API_URL}/orders/${orderData.orderId}/receipt`, {
                method: 'POST',
                body: formData
            });
            
            if (uploadResponse.ok) {
                showNotification(`✅ Order placed successfully! Order ID: #${orderData.orderId}`);
            } else {
                showNotification(`⚠️ Order placed but receipt upload failed. Order ID: #${orderData.orderId}`, 'warning');
            }
            
            cart = [];
            saveCart();
            updateCart();
            closeCheckoutModal();
        } else {
            showNotification(orderData.error || 'Error placing order', 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Server error. Please try again.', 'error');
    }
});

// Close checkout modal
document.getElementById('closeCheckoutModal').addEventListener('click', closeCheckoutModal);
document.getElementById('loginOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('loginOverlay')) {
        closeCheckoutModal();
    }
});

// ===== Login Modal Functions =====
function openLoginModal() {
    if (isLoggedIn) {
        // If already logged in, show logout option
        if (confirm('Do you want to logout?')) {
            logout();
        }
    } else {
        loginModal.classList.add('active');
        loginOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    loginModal.classList.remove('active');
    loginOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== Login Form Submission =====
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login successful, user:', data.user);
            
            // Save guest cart before switching
            saveCart();
            
            // Successful login
            isLoggedIn = true;
            currentUser = data.user;
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Clear current cart and load user's cart
            cart = [];
            loadCart();
            
            // Update UI
            updateLoginButton();
            closeLoginModal();
            showNotification(`Welcome back, ${currentUser.name}!`);
            
            // Reset form
            loginForm.reset();
        } else {
            // Check if email is not verified
            if (data.emailNotVerified) {
                showNotification(data.error, 'error');
                // Show resend verification option
                if (confirm('Would you like to resend the verification email?')) {
                    await resendVerificationEmail(email);
                }
            } else {
                showNotification(data.error || 'Login failed', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Server error. Please try again.', 'error');
    }
}

// ===== Resend Verification Email =====
async function resendVerificationEmail(email) {
    try {
        const response = await fetch(`${API_URL}/resend-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Verification email sent! Please check your inbox.', 'success');
        } else {
            showNotification(data.error || 'Failed to send verification email', 'error');
        }
    } catch (error) {
        console.error('Resend verification error:', error);
        showNotification('Server error. Please try again.', 'error');
    }
}

// ===== Logout Function =====
function logout() {
    console.log('Logging out, current cart:', cart);
    
    // Save current user's cart before logout
    saveCart();
    
    // Clear user session
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Clear cart array
    cart = [];
    console.log('Cart cleared, loading guest cart...');
    
    // Load guest cart
    loadCart();
    
    // Force update cart display
    updateCart();
    updateLoginButton();
    
    console.log('Logout complete, new cart:', cart);
    showNotification('You have been logged out successfully!');
}

// ===== Update Login Button =====
function updateLoginButton() {
    if (isLoggedIn) {
        const roleIcon = getRoleIcon(currentUser.role);
        const roleColor = getRoleColor(currentUser.role);
        loginButton.innerHTML = `${roleIcon} ${currentUser.name} (${currentUser.role})`;
        loginButton.classList.add('logged-in');
        loginButton.style.background = roleColor;
    } else {
        loginButton.innerHTML = `<i class="fas fa-user"></i> Login`;
        loginButton.classList.remove('logged-in');
        loginButton.style.background = '';
    }
}

// ===== Get Role Icon =====
function getRoleIcon(role) {
    switch(role) {
        case 'admin':
            return '<i class="fas fa-user-shield"></i>';
        case 'editor':
            return '<i class="fas fa-user-edit"></i>';
        default:
            return '<i class="fas fa-user-check"></i>';
    }
}

// ===== Get Role Color =====
function getRoleColor(role) {
    switch(role) {
        case 'admin':
            return '#dc2626'; // Red
        case 'editor':
            return '#f59e0b'; // Orange
        default:
            return '#10b981'; // Green
    }
}

// ===== Event Listeners for Login =====
loginButton.addEventListener('click', openLoginModal);
closeModal.addEventListener('click', closeLoginModal);
loginOverlay.addEventListener('click', closeLoginModal);
loginForm.addEventListener('submit', handleLogin);

// ===== Signup Modal Functions =====
function openSignupModal() {
    closeLoginModal();
    signupModal.classList.add('active');
    loginOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSignupModalFunc() {
    signupModal.classList.remove('active');
    loginOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    openSignupModal();
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeSignupModalFunc();
    openLoginModal();
});

closeSignupModal.addEventListener('click', closeSignupModalFunc);

// ===== Signup Form Submission =====
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupConfirmPassword').value;
    
    // Validate name
    if (name.length < 2) {
        showNotification('Please enter your full name', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }
    
    // Validate passwords match
    if (password !== passwordConfirm) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Account created successfully! You can now login.', 'success');
            closeSignupModalFunc();
            signupForm.reset();
            
            // Show success message
            alert('✅ Registration successful!\n\nYou can now login with your credentials.');
            
            // Auto-fill login form
            document.getElementById('loginEmail').value = email;
            openLoginModal();
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Server error. Please try again.', 'error');
    }
});

// ===== Load Site Settings =====
async function loadSiteSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();
        const settings = data.settings;
        
        // Store settings globally
        siteSettings = settings;
        
        // Update hero section
        if (settings.hero_title) {
            document.getElementById('heroTitle').textContent = settings.hero_title;
        }
        if (settings.hero_subtitle) {
            document.getElementById('heroSubtitle').textContent = settings.hero_subtitle;
        }
        if (settings.hero_button_text) {
            document.getElementById('heroButton').textContent = settings.hero_button_text;
        }
        if (settings.site_name) {
            document.getElementById('siteName').textContent = settings.site_name;
            document.title = settings.site_name + ' - Quality Mobile Accessories';
        }
        
        // Update hero background image
        if (settings.hero_background_image) {
            const heroSection = document.querySelector('.hero');
            heroSection.style.backgroundImage = `linear-gradient(rgba(37, 99, 235, 0.8), rgba(30, 64, 175, 0.8)), url('${settings.hero_background_image}')`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
            heroSection.style.backgroundAttachment = 'fixed';
        }
        
        // Update about text
        if (settings.about_text) {
            const aboutText = document.getElementById('aboutText');
            if (aboutText) {
                aboutText.textContent = settings.about_text;
            }
        }
        
        // Apply color settings
        if (settings.primary_color) {
            document.documentElement.style.setProperty('--primary-color', settings.primary_color);
        }
        if (settings.text_color) {
            document.documentElement.style.setProperty('--text-dark', settings.text_color);
            document.body.style.color = settings.text_color;
        }
        if (settings.heading_color) {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .section-title');
            headings.forEach(heading => {
                heading.style.color = settings.heading_color;
            });
        }
        
        // Update social media links
        if (settings.social_facebook) {
            const fbLink = document.getElementById('socialFacebook');
            if (fbLink) fbLink.href = settings.social_facebook;
        }
        if (settings.social_instagram) {
            const igLink = document.getElementById('socialInstagram');
            if (igLink) igLink.href = settings.social_instagram;
        }
        if (settings.social_tiktok) {
            const ttLink = document.getElementById('socialTiktok');
            if (ttLink) ttLink.href = settings.social_tiktok;
        }
        if (settings.social_telegram) {
            const tgLink = document.getElementById('socialTelegram');
            if (tgLink) tgLink.href = settings.social_telegram;
        }
        
        // Update phone number
        if (settings.phone_number) {
            const phoneLinks = document.querySelectorAll('.phone-icon');
            phoneLinks.forEach(link => {
                link.href = 'tel:' + settings.phone_number;
            });
        }
        
        // Apply font settings
        if (settings.font_family) {
            document.body.style.fontFamily = settings.font_family;
        }
        if (settings.heading_font) {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .logo, .nav-link');
            headings.forEach(heading => {
                heading.style.fontFamily = settings.heading_font;
            });
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ===== Check for Saved User Session =====
function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateLoginButton();
    }
    // Load cart for current user (or guest)
    loadCart();
}

// ===== Initialize on Page Load =====
document.addEventListener('DOMContentLoaded', () => {
    loadSiteSettings();
    checkUserSession();
    fetchProducts();
    updateCart();
});

// ===== Add fadeOut animation for notifications =====
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);
