# Ermi Mobile - Default Accounts

## 🔐 Login Credentials

### 👑 Admin Account
- **Email:** `admin@emobile.com`
- **Password:** `admin123`
- **Role:** Admin
- **Permissions:** Full access to all features
- **Color Badge:** Red 🔴

**Admin Capabilities:**
- View all orders from all users
- Manage products (add, edit, delete)
- Manage users
- Access to admin dashboard
- Full system control

---

### ✏️ Editor Account
- **Email:** `editor@emobile.com`
- **Password:** `editor123`
- **Role:** Editor
- **Permissions:** Can edit products and content
- **Color Badge:** Orange 🟠

**Editor Capabilities:**
- Edit product information
- Manage product descriptions
- Update product prices
- View orders
- Cannot delete users or products

---

### 👤 User Account
- **Email:** `user@emobile.com`
- **Password:** `user123`
- **Role:** User
- **Permissions:** Standard customer access
- **Color Badge:** Green 🟢

**User Capabilities:**
- Browse products
- Add items to cart
- Place orders
- View own order history
- Update own profile

---

## 🚀 How to Login

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Click "Login" button** in the header

4. **Enter credentials** from above

5. **You'll see your role** displayed next to your name with a colored badge

---

## 🎨 Role Indicators

When logged in, you'll see:
- **Admin:** Red badge with shield icon 🛡️
- **Editor:** Orange badge with edit icon ✏️
- **User:** Green badge with check icon ✓

---

## 📝 Creating New Accounts

You can also register new accounts:
1. Click "Login"
2. Click "Sign up" (coming soon feature)
3. Or use the API endpoint: `POST /api/register`

**API Example:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

---

## 🔒 Security Features

- ✅ Passwords are hashed with bcrypt
- ✅ Role-based access control
- ✅ Secure session management
- ✅ SQL injection prevention
- ✅ Input validation

---

## 📊 Database Structure

**Users Table:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Roles:**
- `admin` - Full system access
- `editor` - Content management access
- `user` - Standard customer access

---

## 🧪 Testing Different Roles

1. **Test Admin Features:**
   - Login as admin@emobile.com
   - Access all administrative functions

2. **Test Editor Features:**
   - Login as editor@emobile.com
   - Edit product information

3. **Test User Features:**
   - Login as user@emobile.com
   - Shop and place orders

---

## 💡 Tips

- **Remember:** All passwords are case-sensitive
- **Default accounts** are created automatically on first server start
- **Change passwords** in production environments
- **Logout** by clicking your name in the header

---

## 🎛️ Admin Dashboard

Access the admin dashboard to view and manage the database:

**URL:** `http://localhost:3000/admin`

**Features:**
- 📊 Dashboard with statistics (users, products, orders, revenue)
- 👥 View all users with their roles
- 📦 View all products with prices and stock
- 🛒 View all orders with status
- 📈 Real-time data from SQLite database

**Dashboard Sections:**
1. **Dashboard** - Overview statistics and charts
2. **Users** - Complete user database table
3. **Products** - Product catalog management
4. **Orders** - Order history and tracking

**How to Access:**
1. Start server: `npm start`
2. Open: `http://localhost:3000/admin`
3. View all database tables in a clean interface

---

**Happy Testing! 🎉**
