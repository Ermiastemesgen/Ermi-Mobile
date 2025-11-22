# User Roles System Guide 👥

## What Are User Roles?

Your website has a **role-based access control** system with 3 different user roles:

### 1. **Admin** 👑
- **Full access** to everything
- Can manage products, categories, orders
- Can view all users and statistics
- Can access admin panel
- Can approve/reject orders

### 2. **Editor** ✏️
- Can manage products and categories
- Can view orders
- Limited admin access
- Cannot delete critical data

### 3. **User** 🛒
- Regular customer
- Can browse products
- Can add to cart and place orders
- Cannot access admin panel

---

## Where Roles Are Stored

### Database Table: `users`

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',  ← Role is stored here
    email_verified INTEGER,
    created_at DATETIME
);
```

### Possible Role Values:
- `'admin'` - Administrator
- `'editor'` - Editor
- `'user'` - Regular user (default)

---

## Where Roles Are Applied

### 1. **Admin Panel Access** (admin-simple.html)

The admin panel checks if user is logged in and has admin/editor role:

```javascript
// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    // Not logged in - redirect to main page
    window.location.href = '/';
}

if (currentUser.role !== 'admin' && currentUser.role !== 'editor') {
    // Not admin or editor - redirect
    alert('Access denied. Admin privileges required.');
    window.location.href = '/';
}
```

**Location:** `admin-simple.html` (around line 50-60)

---

### 2. **API Endpoints** (server.js)

Currently, the API endpoints don't enforce role checking (they should!). Here's where they would be applied:

#### Products Management:
```javascript
// Create product - Should be admin/editor only
app.post('/api/admin/products', (req, res) => {
    // TODO: Check if user is admin/editor
});

// Update product - Should be admin/editor only
app.put('/api/admin/products/:id', (req, res) => {
    // TODO: Check if user is admin/editor
});

// Delete product - Should be admin only
app.delete('/api/admin/products/:id', (req, res) => {
    // TODO: Check if user is admin
});
```

#### Orders Management:
```javascript
// Update order status - Should be admin only
app.put('/api/admin/orders/:id/status', (req, res) => {
    // TODO: Check if user is admin
});

// Delete order - Should be admin only
app.delete('/api/admin/orders/:id', (req, res) => {
    // TODO: Check if user is admin
});
```

---

## Current Default Accounts

### Admin Account:
```
Email: admin@ermimobile.com
Password: admin123
Role: admin
```

### Editor Account:
```
Email: editor@ermimobile.com
Password: editor123
Role: editor
```

### Regular User Account:
```
Email: user@ermimobile.com
Password: user123
Role: user
```

---

## How to Check User Role

### Method 1: Check in Database

```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.all('SELECT id, name, email, role FROM users', (err, rows) => { console.table(rows); db.close(); });"
```

### Method 2: Check in Browser (After Login)

Open browser console (F12) and type:
```javascript
JSON.parse(localStorage.getItem('currentUser'))
```

You'll see:
```json
{
    "id": 1,
    "name": "Admin",
    "email": "admin@ermimobile.com",
    "role": "admin"
}
```

---

## How to Change User Role

### Method 1: Using Script

Create file: `change-user-role.js`

```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./emobile.db');

const email = 'user@example.com';  // Change this
const newRole = 'admin';           // Change this: 'admin', 'editor', or 'user'

db.run(
    'UPDATE users SET role = ? WHERE email = ?',
    [newRole, email],
    function(err) {
        if (err) {
            console.error('❌ Error:', err.message);
        } else if (this.changes === 0) {
            console.log('❌ User not found');
        } else {
            console.log('✅ Role updated!');
            console.log('📧 Email:', email);
            console.log('👤 New role:', newRole);
        }
        db.close();
    }
);
```

Run:
```bash
node change-user-role.js
```

### Method 2: Quick Command

```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', 'user@example.com'], function(err) { console.log(err || '✅ Done! User is now admin'); db.close(); });"
```

**Replace:**
- `'admin'` with desired role
- `'user@example.com'` with user's email

---

## How to Make Someone Admin

### Option 1: During Registration

When registering, you can specify role (currently not exposed in UI):

```javascript
// In registration API call
fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'New Admin',
        email: 'newadmin@example.com',
        password: 'password123',
        role: 'admin'  // Add this
    })
});
```

### Option 2: After Registration

1. User registers normally (becomes 'user')
2. You update their role in database:
   ```bash
   node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.run('UPDATE users SET role = \"admin\" WHERE email = \"newadmin@example.com\"', (err) => { console.log(err || '✅ User is now admin'); db.close(); });"
   ```

### Option 3: Create Admin Directly

```javascript
// create-admin.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./emobile.db');

const admin = {
    name: 'Your Name',
    email: 'your@email.com',
    password: 'your-password',
    role: 'admin'
};

bcrypt.hash(admin.password, 10).then(hash => {
    db.run(
        'INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, 1)',
        [admin.name, admin.email, hash, admin.role],
        (err) => {
            console.log(err || '✅ Admin created!');
            db.close();
        }
    );
});
```

---

## Role Permissions Matrix

| Feature | Admin | Editor | User |
|---------|-------|--------|------|
| Browse products | ✅ | ✅ | ✅ |
| Add to cart | ✅ | ✅ | ✅ |
| Place orders | ✅ | ✅ | ✅ |
| Access admin panel | ✅ | ✅ | ❌ |
| Create products | ✅ | ✅ | ❌ |
| Edit products | ✅ | ✅ | ❌ |
| Delete products | ✅ | ⚠️ | ❌ |
| Manage categories | ✅ | ✅ | ❌ |
| View orders | ✅ | ✅ | ❌ |
| Approve/reject orders | ✅ | ⚠️ | ❌ |
| Delete orders | ✅ | ❌ | ❌ |
| View statistics | ✅ | ✅ | ❌ |

✅ = Full access
⚠️ = Limited access
❌ = No access

---

## Security Note ⚠️

**Current Issue:** The API endpoints don't verify user roles!

Anyone who knows the API endpoints can:
- Create/edit/delete products
- Manage orders
- Access admin functions

**Recommendation:** Add role verification to API endpoints (see next section)

---

## How to Add Role Protection to API

### Add Middleware:

```javascript
// Add to server.js
function requireAdmin(req, res, next) {
    const userId = req.headers['user-id'];
    const userRole = req.headers['user-role'];
    
    if (!userId || userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
}

function requireAdminOrEditor(req, res, next) {
    const userId = req.headers['user-id'];
    const userRole = req.headers['user-role'];
    
    if (!userId || (userRole !== 'admin' && userRole !== 'editor')) {
        return res.status(403).json({ error: 'Admin or editor access required' });
    }
    
    next();
}
```

### Use in Routes:

```javascript
// Only admin can delete
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    // Delete product
});

// Admin or editor can create
app.post('/api/admin/products', requireAdminOrEditor, (req, res) => {
    // Create product
});
```

---

## Quick Commands

### List all users with roles:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.all('SELECT id, name, email, role FROM users', (err, rows) => { console.table(rows); db.close(); });"
```

### Make user admin:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.run('UPDATE users SET role = \"admin\" WHERE email = \"user@example.com\"', (err) => { console.log(err || '✅ Done'); db.close(); });"
```

### Count users by role:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.all('SELECT role, COUNT(*) as count FROM users GROUP BY role', (err, rows) => { console.table(rows); db.close(); });"
```

---

## Summary

### What is Admin Role?
- A permission level stored in the database
- Determines what users can access and do
- Three levels: admin, editor, user

### Where is it Applied?
- ✅ Admin panel access (frontend check)
- ❌ API endpoints (not protected yet - should be added)
- ✅ Login response (role is returned)

### How to Get Admin Role?
1. Use default admin account: `admin@ermimobile.com`
2. Create new admin via script
3. Update existing user's role in database

---

**Need to make someone admin? Use the commands above!** 👑

---
**Date:** 2025-11-22
**Status:** Role system explained
