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
            tbody.innerHTML = data.users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
            console.log('Users table updated');
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="5">Error: ' + error.message + '</td></tr>';
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
            tbody.innerHTML = data.products.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td><i class="fas ${product.icon}"></i></td>
                    <td>${product.stock || 100}</td>
                </tr>
            `).join('');
            console.log('Products table updated');
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No products found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsTableBody').innerHTML = 
            '<tr><td colspan="5">Error: ' + error.message + '</td></tr>';
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
