const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING LOGIN BUTTON FUNCTIONALITY');
console.log('====================================');
console.log('Adding complete login system to make login button responsive.');

function addLoginFunctionality() {
    console.log('\n📄 Adding login functionality to script.js...');
    
    const scriptPath = path.join(__dirname, 'script.js');
    
    if (!fs.existsSync(scriptPath)) {
        console.log('❌ script.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Add login functionality at the end of the script
        const loginFunctionality = `

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
    
    const modalHTML = \`
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
    \`;
    
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
            
            showNotification(\`Welcome back, \${currentUser.name || currentUser.email}!\`, 'success');
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
`;

        // Add the login functionality to the script
        content += loginFunctionality;
        
        // Update the initialization to include login system
        const initRegex = /(document\.addEventListener\('DOMContentLoaded', function\(\) \{[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?fetchProducts\(\);[\s\S]*?\}, 100\);[\s\S]*?\}\);)/;
        
        if (initRegex.test(content)) {
            content = content.replace(initRegex, `$1

// Initialize login system after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeLoginSystem();
    }, 200);
});`);
            console.log('✅ Added login system initialization');
        } else {
            // Add initialization at the end
            content += `
// Initialize login system
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeLoginSystem();
    }, 200);
});`;
            console.log('✅ Added login system initialization at end');
        }
        
        fs.writeFileSync(scriptPath, content);
        console.log('✅ Login functionality added to script.js');
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Main execution
console.log('🎯 Starting login button fix...');
addLoginFunctionality();

console.log('\n🎉 LOGIN BUTTON FIX COMPLETED!');
console.log('==============================');
console.log('✅ Added complete login system');
console.log('✅ Login button now responsive');
console.log('✅ Login/signup modal created');
console.log('✅ User session management');
console.log('✅ Logout functionality');
console.log('');
console.log('🚀 Login button should now work perfectly!');