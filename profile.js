// API URL configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`;

let currentUser = null;

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = '/';
        return false;
    }
    
    try {
        currentUser = JSON.parse(user);
        return true;
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        window.location.href = '/';
        return false;
    }
}

// Load user profile
async function loadProfile() {
    if (!checkAuth()) return;
    
    // Display user info
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('displayName').textContent = currentUser.name;
    document.getElementById('displayEmail').textContent = currentUser.email;
    document.getElementById('displayRole').textContent = currentUser.role || 'user';
    
    if (currentUser.created_at) {
        const date = new Date(currentUser.created_at);
        document.getElementById('displayDate').textContent = date.toLocaleDateString();
    }
    
    // Load orders
    await loadOrders();
}

// Load user orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders/${currentUser.id}`);
        const data = await response.json();
        
        const ordersList = document.getElementById('ordersList');
        
        if (data.orders && data.orders.length > 0) {
            ordersList.innerHTML = data.orders.map(order => `
                <div class="order-item">
                    <div class="order-header">
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                    <div style="display: grid; gap: 8px; font-size: 14px; color: #666;">
                        <div><strong>Total:</strong> ${order.total.toFixed(2)} Birr</div>
                        <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
                        ${order.payment_method ? `<div><strong>Payment:</strong> ${order.payment_method}</div>` : ''}
                    </div>
                </div>
            `).join('');
        } else {
            ordersList.innerHTML = '<p style="text-align: center; color: #999;">No orders yet</p>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersList').innerHTML = 
            '<p style="text-align: center; color: #ef4444;">Error loading orders</p>';
    }
}

// Toggle edit mode
function toggleEdit() {
    const profileView = document.getElementById('profileView');
    const editForm = document.getElementById('editForm');
    const profileActions = document.getElementById('profileActions');
    
    profileView.style.display = 'none';
    editForm.classList.add('active');
    profileActions.style.display = 'none';
    
    // Populate form
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editEmail').value = currentUser.email;
}

// Cancel edit
function cancelEdit() {
    const profileView = document.getElementById('profileView');
    const editForm = document.getElementById('editForm');
    const profileActions = document.getElementById('profileActions');
    
    profileView.style.display = 'grid';
    editForm.classList.remove('active');
    profileActions.style.display = 'flex';
}

// Update profile
document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    
    try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update local storage
            currentUser.name = name;
            currentUser.email = email;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            // Reload profile
            loadProfile();
            cancelEdit();
            
            alert('Profile updated successfully!');
        } else {
            const error = await response.json();
            alert('Failed to update profile: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error: ' + error.message);
    }
});

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = '/';
    }
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    updateCartCount();
});
