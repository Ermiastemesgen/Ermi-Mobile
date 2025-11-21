# Fix: "Error Loading Products" on Render

Your app is deployed successfully! The error means the database is empty (no products yet).

## 🎯 Quick Fix: Add Products

You have 2 options:

### Option 1: Use Admin Panel (Easiest)

1. **Go to your admin panel:**
   ```
   https://your-app-name.onrender.com/admin-simple.html
   ```

2. **Login with default admin account:**
   - Email: `admin@ermimobile.com`
   - Password: `admin123`

3. **Add products:**
   - Scroll to "Products" section
   - Click "Add New Product"
   - Fill in product details
   - Click "Save"

4. **Refresh your main page** - products should appear!

### Option 2: Add Sample Products via Database

The database is created but empty. You need to add products.

## 🔍 Why This Happens

When you deploy to Render:
1. ✅ Database file is created
2. ✅ Tables are created
3. ❌ No data is inserted (empty tables)

Your local database has products, but Render starts fresh.

## 📊 Check What's in Database

### Option A: Use Render Shell

1. Go to Render dashboard
2. Click on your service
3. Click **"Shell"** tab (top right)
4. Run:
   ```bash
   node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.all('SELECT * FROM products', [], (err, rows) => { console.log('Products:', rows); db.close(); });"
   ```

### Option B: Check via API

Visit this URL in your browser:
```
https://your-app-name.onrender.com/api/products
```

You'll see: `{"products":[]}`

This confirms the database is empty.

## ✅ Solution: Add Products via Admin

### Step 1: Access Admin Panel
```
https://your-app-name.onrender.com/admin-simple.html
```

### Step 2: Login
- Email: `admin@ermimobile.com`
- Password: `admin123`

If login doesn't work, the users table might also be empty.

### Step 3: Create Admin User (if needed)

If you can't login, use Render Shell:

1. Go to Render → Your Service → Shell
2. Run this command:

```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const bcrypt = require('bcrypt'); const db = new sqlite3.Database('./emobile.db'); bcrypt.hash('admin123', 10, (err, hash) => { db.run('INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)', ['Admin', 'admin@ermimobile.com', hash, 'admin', 1], (err) => { if (err) console.log('Error:', err.message); else console.log('Admin user created!'); db.close(); }); });"
```

### Step 4: Add Sample Products

In Render Shell, run:

```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); const products = [{name: 'Wireless Earbuds', price: 1500, icon: 'fa-headphones', stock: 50, description: 'High quality wireless earbuds'}, {name: 'Phone Case', price: 500, icon: 'fa-mobile-alt', stock: 100, description: 'Protective phone case'}, {name: 'Fast Charger', price: 800, icon: 'fa-charging-station', stock: 75, description: 'Quick charge adapter'}]; products.forEach(p => { db.run('INSERT INTO products (name, price, icon, stock, description) VALUES (?, ?, ?, ?, ?)', [p.name, p.price, p.icon, p.stock, p.description]); }); setTimeout(() => { console.log('Products added!'); db.close(); }, 1000);"
```

## 🚀 Better Solution: Create Seed Script

Create a file called `seed-database.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./emobile.db');

console.log('Seeding database...');

// Create admin user
bcrypt.hash('admin123', 10, (err, hash) => {
    db.run(
        'INSERT OR IGNORE INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)',
        ['Admin', 'admin@ermimobile.com', hash, 'admin', 1],
        (err) => {
            if (err) console.log('Admin exists or error:', err.message);
            else console.log('✅ Admin user created');
        }
    );
});

// Add sample products
const products = [
    { name: 'Wireless Earbuds Pro', price: 2500, icon: 'fa-headphones', stock: 50, description: 'Premium wireless earbuds with noise cancellation', category_id: null },
    { name: 'Protective Phone Case', price: 500, icon: 'fa-mobile-alt', stock: 100, description: 'Durable protective case for all phone models', category_id: null },
    { name: 'Fast Charger 20W', price: 800, icon: 'fa-charging-station', stock: 75, description: 'Quick charge adapter with USB-C', category_id: null },
    { name: 'Screen Protector', price: 300, icon: 'fa-shield-alt', stock: 150, description: 'Tempered glass screen protector', category_id: null },
    { name: 'Power Bank 10000mAh', price: 1800, icon: 'fa-battery-full', stock: 40, description: 'Portable power bank with fast charging', category_id: null },
    { name: 'USB Cable 2m', price: 400, icon: 'fa-plug', stock: 200, description: 'Durable USB-C charging cable', category_id: null },
    { name: 'Phone Holder', price: 600, icon: 'fa-car', stock: 80, description: 'Car phone holder with adjustable grip', category_id: null },
    { name: 'Bluetooth Speaker', price: 3500, icon: 'fa-volume-up', stock: 30, description: 'Portable Bluetooth speaker with bass boost', category_id: null }
];

products.forEach((product, index) => {
    setTimeout(() => {
        db.run(
            'INSERT INTO products (name, price, icon, stock, description, category_id) VALUES (?, ?, ?, ?, ?, ?)',
            [product.name, product.price, product.icon, product.stock, product.description, product.category_id],
            (err) => {
                if (err) console.log('Error adding product:', err.message);
                else console.log(`✅ Added: ${product.name}`);
            }
        );
    }, index * 100);
});

// Close database after all operations
setTimeout(() => {
    db.close();
    console.log('\n✅ Database seeded successfully!');
}, 2000);
```

### Run the seed script:

**Locally:**
```bash
node seed-database.js
```

**On Render (via Shell):**
```bash
node seed-database.js
```

## 📝 Add to package.json

Add a seed script to your `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "seed": "node seed-database.js"
  }
}
```

Then in Render Shell:
```bash
npm run seed
```

## 🔄 Automatic Seeding on Deploy

Update your `server.js` to seed on first run:

Add this after database initialization:

```javascript
// Check if database is empty and seed if needed
db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (!err && row.count === 0) {
        console.log('Database is empty, seeding with sample data...');
        // Add sample products here
        const sampleProducts = [
            { name: 'Wireless Earbuds', price: 2500, icon: 'fa-headphones', stock: 50 },
            { name: 'Phone Case', price: 500, icon: 'fa-mobile-alt', stock: 100 },
            { name: 'Fast Charger', price: 800, icon: 'fa-charging-station', stock: 75 }
        ];
        
        sampleProducts.forEach(p => {
            db.run('INSERT INTO products (name, price, icon, stock) VALUES (?, ?, ?, ?)',
                [p.name, p.price, p.icon, p.stock]);
        });
        
        console.log('✅ Sample products added');
    }
});
```

## 🎯 Recommended Approach

1. **Create `seed-database.js`** file (I'll create it for you)
2. **Commit and push** to GitHub
3. **In Render Shell**, run: `node seed-database.js`
4. **Refresh your website** - products appear!

## 🆘 Still Not Working?

### Check Render Logs:
1. Render Dashboard → Your Service
2. Click **"Logs"** tab
3. Look for database errors

### Check API Response:
Visit: `https://your-app-name.onrender.com/api/products`

Should show products array.

### Verify Database Tables:
In Render Shell:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.all('SELECT name FROM sqlite_master WHERE type=\"table\"', [], (err, rows) => { console.log('Tables:', rows); db.close(); });"
```

---

**Quick Fix:** Use admin panel to add products manually, or run the seed script in Render Shell!
