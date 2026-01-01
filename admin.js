// Automatically detect if running locally or on production
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`;

// Navigation
document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        document.getElementById('pageTitle').textContent = 
            section.charAt(0).toUpperCase() + section.slice(1);
        
        loadSectionData(section);
    });
});

async function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'contacts':
            await loadContacts();
            break;
    }
}

async function loadDashboard() {
    try {
        console.log('Loading dashboard...');
        
        // Load users
        const usersRes = await fetch(`${API_URL}/admin/users`);
        const users = await usersRes.json();
        console.log('Users loaded:', users);
        document.getElementById('totalUsers').textContent = users.users?.length || 0;

        // Load products
        const productsRes = await fetch(`${API_URL}/products`);
        const products = await productsRes.json();
        console.log('Products loaded:', products);
        document.getElementById('totalProducts').textContent = products.products?.length || 0;

        // Load orders
        const ordersRes = await fetch(`${API_URL}/admin/orders`);
        const orders = await ordersRes.json();
        console.log('Orders loaded:', orders);
        document.getElementById('totalOrders').textContent = orders.orders?.length || 0;
        
        const revenue = orders.orders?.reduce((sum, order) => sum + order.total, 0) || 0;
        document.getElementById('totalRevenue').textContent = 'Br ' + revenue.toFixed(2);
        
        console.log('Dashboard loaded successfully!');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard: ' + error.message);
    }
}

async function loadUsers() {
    try {
        console.log('Loading users...');
        const response = await fetch(`${API_URL}/admin/users`);
        const data = await response.json();
        console.log('Users data:', data);
        
        const tbody = document.getElementById('usersTableBody');
        
        if (data.users && data.users.length > 0) {
            tbody.innerHTML = data.users.map(user => {
                console.log('Processing user:', user.name, 'Role:', user.role);
                return `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                        <td>${new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                            ${user.role !== 'admin' ? 
                                `<button onclick="deleteUser(${user.id}, '${user.name}')" class="btn-small btn-danger">Delete</button>` : 
                                '<span style="color: #6b7280; font-size: 0.85rem;">Protected</span>'
                            }
                        </td>
                    </tr>
                `;
            }).join('');
            console.log('Users table updated with delete buttons');
        } else {
            tbody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="6">Error: ' + error.message + '</td></tr>';
    }
}

async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers();
            loadDashboard(); // Refresh stats
        } else {
            const error = await response.json();
            alert('Failed to delete user: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error: ' + error.message);
    }
}

async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        console.log('Products data:', data);
        
        const tbody = document.getElementById('productsTableBody');
        
        if (data.products && data.products.length > 0) {
            tbody.innerHTML = data.products.map((product, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td><i class="fas ${product.icon}"></i></td>
                    <td>${product.stock || 100}</td>
                    <td>
                        <button onclick="editProduct(${product.id})" class="btn-small btn-primary">Edit</button>
                        <button onclick="deleteProduct(${product.id})" class="btn-small btn-danger">Delete</button>
                    </td>
                </tr>
            `).join('');
            console.log('Products table updated with', data.products.length, 'products');
        } else {
            tbody.innerHTML = '<tr><td colspan="6">No products found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsTableBody').innerHTML = 
            '<tr><td colspan="6">Error: ' + error.message + '</td></tr>';
    }
}

async function loadOrders() {
    try {
        console.log('Loading orders...');
        const response = await fetch(`${API_URL}/admin/orders`);
        const data = await response.json();
        console.log('Orders data:', data);
        
        const tbody = document.getElementById('ordersTableBody');
        
        if (data.orders && data.orders.length > 0) {
            tbody.innerHTML = data.orders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.user_id || 'Guest'}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
            console.log('Orders table updated');
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No orders yet</td></tr>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersTableBody').innerHTML = 
            '<tr><td colspan="5">Error: ' + error.message + '</td></tr>';
    }
}

async function loadContacts() {
    try {
        console.log('Loading contacts...');
        const response = await fetch(`${API_URL}/admin/contacts`);
        const data = await response.json();
        console.log('Contacts data:', data);
        
        const tbody = document.getElementById('contactsTableBody');
        
        if (data.contacts && data.contacts.length > 0) {
            tbody.innerHTML = data.contacts.map(contact => `
                <tr>
                    <td>${contact.id}</td>
                    <td>${contact.name}</td>
                    <td>${contact.email}</td>
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${contact.message}</td>
                    <td><span class="status-badge status-${contact.status}">${contact.status}</span></td>
                    <td>${new Date(contact.created_at).toLocaleDateString()}</td>
                    <td>
                        <button onclick="updateContactStatus(${contact.id}, 'read')" class="btn-small btn-success">Mark Read</button>
                        <button onclick="deleteContact(${contact.id})" class="btn-small btn-danger">Delete</button>
                    </td>
                </tr>
            `).join('');
            console.log('Contacts table updated');
        } else {
            tbody.innerHTML = '<tr><td colspan="7">No contact messages yet</td></tr>';
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
        document.getElementById('contactsTableBody').innerHTML = 
            '<tr><td colspan="7">Error: ' + error.message + '</td></tr>';
    }
}

async function updateContactStatus(id, status) {
    try {
        const response = await fetch(`${API_URL}/admin/contacts/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            alert('Contact status updated!');
            loadContacts();
        } else {
            alert('Failed to update contact status');
        }
    } catch (error) {
        console.error('Error updating contact:', error);
        alert('Error: ' + error.message);
    }
}

async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact message?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/contacts/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Contact deleted!');
            loadContacts();
        } else {
            alert('Failed to delete contact');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Error: ' + error.message);
    }
}

// Product Management Functions
async function editProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const data = await response.json();
        const product = data.product;
        
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductDescription').value = product.description || '';
        document.getElementById('editProductStock').value = product.stock || 100;
        
        // Load product images
        await loadProductImages(product.id);
        
        document.getElementById('editProductModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product: ' + error.message);
    }
}

async function loadProductImages(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}/images`);
        const data = await response.json();
        
        const container = document.getElementById('productImagesContainer');
        
        if (data.images && data.images.length > 0) {
            container.innerHTML = data.images.map(img => `
                <div class="image-item">
                    <img src="${img.image_url}" alt="Product image">
                    <button type="button" class="delete-image-btn" onclick="deleteProductImage(${img.id})" title="Delete this image">×</button>
                    ${img.is_main ? '<span class="main-badge">Main</span>' : ''}
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>No images available</p>';
        }
    } catch (error) {
        console.error('Error loading images:', error);
        document.getElementById('productImagesContainer').innerHTML = '<p>Error loading images</p>';
    }
}

async function deleteProductImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/products/images/${imageId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Image deleted successfully!');
            const productId = document.getElementById('editProductId').value;
            await loadProductImages(productId);
        } else {
            const error = await response.json();
            alert('Failed to delete image: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error: ' + error.message);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Product deleted successfully!');
            loadProducts();
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error: ' + error.message);
    }
}

function closeEditModal() {
    document.getElementById('editProductModal').style.display = 'none';
}

// Handle edit form submission
document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('editProductForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const productId = document.getElementById('editProductId').value;
            const productData = {
                name: document.getElementById('editProductName').value,
                price: parseFloat(document.getElementById('editProductPrice').value),
                description: document.getElementById('editProductDescription').value,
                stock: parseInt(document.getElementById('editProductStock').value)
            };
            
            try {
                const response = await fetch(`${API_URL}/admin/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                
                if (response.ok) {
                    alert('Product updated successfully!');
                    closeEditModal();
                    loadProducts();
                } else {
                    alert('Failed to update product');
                }
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Error: ' + error.message);
            }
        });
    }
    
    // Close modal when clicking X or outside
    const modal = document.getElementById('editProductModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.onclick = closeEditModal;
    }
    
    if (modal) {
        window.onclick = (event) => {
            if (event.target === modal) {
                closeEditModal();
            }
        };
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Admin Dashboard Initializing ===');
    console.log('API URL:', API_URL);
    console.log('Loading all data...');
    
    loadDashboard();
    loadUsers();
    loadProducts();
    loadOrders();
});

// ===== Settings Management =====

// Load settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();
        const settings = data.settings;

        // Populate location map URL
        if (settings.location_map_url) {
            document.getElementById('locationMapUrl').value = settings.location_map_url;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Handle location settings form submission
document.addEventListener('DOMContentLoaded', () => {
    const locationForm = document.getElementById('locationSettingsForm');
    
    if (locationForm) {
        locationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const locationMapUrl = document.getElementById('locationMapUrl').value;
            
            try {
                const response = await fetch(`${API_URL}/admin/settings/location_map_url`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ value: locationMapUrl })
                });

                if (response.ok) {
                    alert('✅ Location updated successfully!');
                } else {
                    alert('❌ Failed to update location');
                }
            } catch (error) {
                console.error('Error updating location:', error);
                alert('❌ Error updating location');
            }
        });
    }

    // Load settings when settings section is opened
    const settingsNavItem = document.querySelector('[data-section="settings"]');
    if (settingsNavItem) {
        settingsNavItem.addEventListener('click', () => {
            loadSettings();
        });
    }
});
// ===== Security Dashboard Functions =====

async function loadSecurity() {
    try {
        console.log('Loading security dashboard...');
        await refreshSecurityReport();
    } catch (error) {
        console.error('Error loading security dashboard:', error);
    }
}

async function refreshSecurityReport() {
    try {
        const response = await fetch(`${API_URL}/admin/security-report`);
        const report = await response.json();
        
        if (response.ok) {
            updateSecurityDashboard(report);
        } else {
            console.error('Failed to load security report:', report);
            showSecurityError('Failed to load security report');
        }
    } catch (error) {
        console.error('Error fetching security report:', error);
        showSecurityError('Error connecting to security service');
    }
}

function updateSecurityDashboard(report) {
    // Update overview cards
    document.getElementById('totalEvents').textContent = report.totalEvents || 0;
    document.getElementById('highSeverityEvents').textContent = report.highSeverityEvents || 0;
    document.getElementById('suspiciousIPs').textContent = report.suspiciousIPs?.length || 0;
    
    // Update event breakdown
    const eventBreakdown = document.getElementById('eventBreakdown');
    if (report.eventBreakdown && Object.keys(report.eventBreakdown).length > 0) {
        eventBreakdown.innerHTML = Object.entries(report.eventBreakdown)
            .sort(([,a], [,b]) => b - a)
            .map(([event, count]) => `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-weight: 500;">${event.replace(/_/g, ' ')}</span>
                    <span style="background: #3b82f6; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">${count}</span>
                </div>
            `).join('');
    } else {
        eventBreakdown.innerHTML = '<p style="color: #6b7280; font-style: italic;">No events in the last 24 hours</p>';
    }
    
    // Update recent high-severity events
    const recentHighSeverity = document.getElementById('recentHighSeverity');
    if (report.recentHighSeverityEvents && report.recentHighSeverityEvents.length > 0) {
        recentHighSeverity.innerHTML = report.recentHighSeverityEvents.map(event => `
            <div style="padding: 0.75rem; margin-bottom: 0.5rem; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong style="color: #dc2626;">${event.event.replace(/_/g, ' ')}</strong>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: #6b7280;">
                            ${new Date(event.timestamp).toLocaleString()}
                        </p>
                    </div>
                    <span style="background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem;">HIGH</span>
                </div>
            </div>
        `).join('');
    } else {
        recentHighSeverity.innerHTML = '<p style="color: #10b981; font-style: italic;">✅ No high-severity events recently</p>';
    }
    
    console.log('Security dashboard updated successfully');
}

async function exportSecurityReport() {
    try {
        const response = await fetch(`${API_URL}/admin/security-report`);
        const report = await response.json();
        
        if (response.ok) {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert('✅ Security report exported successfully!');
        } else {
            alert('❌ Failed to export security report');
        }
    } catch (error) {
        console.error('Error exporting security report:', error);
        alert('❌ Error exporting security report');
    }
}

async function clearSuspiciousIPs() {
    if (!confirm('Are you sure you want to clear all suspicious IP addresses? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/clear-suspicious-ips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`✅ ${result.message}`);
            await refreshSecurityReport();
        } else {
            alert('❌ Failed to clear suspicious IPs');
        }
    } catch (error) {
        console.error('Error clearing suspicious IPs:', error);
        alert('❌ Error clearing suspicious IPs');
    }
}

async function viewAuditLog() {
    try {
        const response = await fetch(`${API_URL}/admin/audit-log?limit=50`);
        const data = await response.json();
        
        if (response.ok) {
            const modal = document.getElementById('auditLogModal');
            const content = document.getElementById('auditLogContent');
            
            if (data.logs && data.logs.length > 0) {
                content.innerHTML = `
                    <div style="margin-bottom: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
                        <strong>Showing ${data.logs.length} most recent entries (Total: ${data.total})</strong>
                    </div>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${data.logs.map(log => `
                            <div style="padding: 1rem; margin-bottom: 0.5rem; border: 1px solid #e5e7eb; border-radius: 8px; ${getSeverityStyle(log.severity)}">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                    <strong>${log.event.replace(/_/g, ' ')}</strong>
                                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                                        <span style="background: ${getSeverityColor(log.severity)}; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem;">
                                            ${log.severity}
                                        </span>
                                        <span style="font-size: 0.8rem; color: #6b7280;">
                                            ${new Date(log.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                ${log.data && Object.keys(log.data).length > 0 ? `
                                    <details style="margin-top: 0.5rem;">
                                        <summary style="cursor: pointer; color: #3b82f6;">View Details</summary>
                                        <pre style="background: #f9fafb; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-top: 0.5rem; overflow-x: auto;">${JSON.stringify(log.data, null, 2)}</pre>
                                    </details>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                content.innerHTML = '<p style="text-align: center; color: #6b7280; font-style: italic;">No audit log entries found</p>';
            }
            
            modal.style.display = 'block';
        } else {
            alert('❌ Failed to load audit log');
        }
    } catch (error) {
        console.error('Error loading audit log:', error);
        alert('❌ Error loading audit log');
    }
}

function closeAuditLog() {
    document.getElementById('auditLogModal').style.display = 'none';
}

function getSeverityStyle(severity) {
    switch (severity) {
        case 'HIGH':
            return 'border-left: 4px solid #ef4444; background: #fef2f2;';
        case 'MEDIUM':
            return 'border-left: 4px solid #f59e0b; background: #fffbeb;';
        default:
            return 'border-left: 4px solid #10b981; background: #f0fdf4;';
    }
}

function getSeverityColor(severity) {
    switch (severity) {
        case 'HIGH':
            return '#ef4444';
        case 'MEDIUM':
            return '#f59e0b';
        default:
            return '#10b981';
    }
}

function showSecurityError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        z-index: 1000;
    `;
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}

// Update the loadSectionData function to include security
const originalLoadSectionData = loadSectionData;
loadSectionData = async function(section) {
    if (section === 'security') {
        await loadSecurity();
    } else {
        await originalLoadSectionData(section);
    }
};

// Auto-refresh security dashboard every 30 seconds when security section is active
setInterval(() => {
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection && activeSection.id === 'security') {
        refreshSecurityReport();
    }
}, 30000);