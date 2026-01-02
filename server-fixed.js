
// ===== Import Dependencies =====
require('dotenv').config(); // Load environment variables
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ===== Initialize Express App =====
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
// CORS configuration - allow all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add CORS and Security headers
app.use((req, res, next) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

app.use(express.static(__dirname)); // Serve static files

// ===== Storage Configuration =====
const isRender = process.env.RENDER === 'true';
const useRenderPersistentStorage = process.env.USE_PERSISTENT_STORAGE === 'true';

let uploadsDir;
if (isRender && useRenderPersistentStorage && process.env.UPLOADS_PATH) {
    uploadsDir = process.env.UPLOADS_PATH;
    console.log('📁 Using Render Pro persistent storage:', uploadsDir);
} else if (isRender && useRenderPersistentStorage) {
    uploadsDir = '/opt/render/project/src/uploads';
    console.log('📁 Using Render Pro default persistent storage:', uploadsDir);
} else {
    uploadsDir = path.join(__dirname, 'uploads');
    console.log('📁 Using local storage:', uploadsDir);
}

if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Created uploads directory:', uploadsDir);
    } catch (error) {
        console.error('❌ Failed to create uploads directory:', error.message);
        uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    }
}
app.use('/uploads', express.static(uploadsDir));

// ===== Cloudinary Configuration =====
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('☁️  Cloudinary configured for image storage');
} else {
    console.log('📁 Using local file storage');
}

// Configure multer storage
const storage = useCloudinary 
    ? new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'ermi-mobile',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 2000, height: 2000, crop: 'limit', quality: 'auto' }],
            public_id: (req, file) => {
                const prefix = file.fieldname === 'receipt' ? 'receipt' : 'product';
                return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            }
        }
    })
    : multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const prefix = file.fieldname === 'receipt' ? 'receipt-' : 'product-';
            cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
        }
    });

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// ===== Initialize Database =====
const dbPath = process.env.DATABASE_PATH || './emobile.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// ===== Create Database Tables =====
function initializeDatabase() {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            email_verified INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('✅ Users table ready');
            createDefaultAccounts();
        }
    });

    // Products table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            icon TEXT NOT NULL,
            description TEXT,
            stock INTEGER DEFAULT 100,
            image TEXT,
            images TEXT,
            category_id INTEGER,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating products table:', err.message);
        } else {
            console.log('✅ Products table ready');
        }
    });

    // Categories table
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            parent_id INTEGER,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating categories table:', err.message);
        } else {
            console.log('✅ Categories table ready');
        }
    });

    // Orders table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            delivery_address TEXT,
            phone_number TEXT,
            payment_receipt TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating orders table:', err.message);
        } else {
            console.log('✅ Orders table ready');
        }
    });

    // Order items table
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating order_items table:', err.message);
        } else {
            console.log('✅ Order items table ready');
        }
    });

    // Contacts table
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating contacts table:', err.message);
        } else {
            console.log('✅ Contacts table ready');
        }
    });

    // Settings table
    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating settings table:', err.message);
        } else {
            console.log('✅ Settings table ready');
            initializeEssentialSettings();
        }
    });
}

// ===== Create Default Accounts =====
async function createDefaultAccounts() {
    const mainAdmin = {
        name: 'Ermias',
        email: 'ermias616@gmail.com',
        password: 'Ermi@0211',
        role: 'admin'
    };

    try {
        const hashedPassword = await bcrypt.hash(mainAdmin.password, 10);
        
        db.get('SELECT * FROM users WHERE email = ?', [mainAdmin.email], (err, user) => {
            if (err) {
                console.error('Error checking main admin:', err.message);
                return;
            }

            if (!user) {
                db.run(
                    'INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, 1)',
                    [mainAdmin.name, mainAdmin.email, hashedPassword, mainAdmin.role],
                    (err) => {
                        if (err) {
                            console.error('Error creating main admin:', err.message);
                        } else {
                            console.log(`✅ Main admin account created: ${mainAdmin.email}`);
                        }
                    }
                );
            } else if (user.role !== 'admin') {
                db.run(
                    'UPDATE users SET role = ?, password = ? WHERE email = ?',
                    [mainAdmin.role, hashedPassword, mainAdmin.email],
                    (err) => {
                        if (err) {
                            console.error('Error updating main admin:', err.message);
                        } else {
                            console.log(`✅ Main admin role updated: ${mainAdmin.email}`);
                        }
                    }
                );
            } else {
                console.log(`✅ Main admin verified: ${mainAdmin.email}`);
            }
        });
    } catch (error) {
        console.error('Error processing main admin:', error);
    }
}

// ===== Initialize Essential Settings =====
function initializeEssentialSettings() {
    console.log('🔧 Initializing essential settings...');
    
    const essentialSettings = [
        { key: 'about_text', value: 'Welcome to Ermi Mobile, your one-stop destination for premium mobile accessories. We pride ourselves on offering high-quality products at competitive prices. From the latest wireless earbuds to durable phone cases and fast chargers, we have everything you need to enhance your mobile experience. Our commitment to customer satisfaction and product excellence has made us a trusted name in mobile accessories. Shop with confidence and discover the perfect accessories for your devices today!' },
        { key: 'site_name', value: 'Ermi Mobile' },
        { key: 'hero_title', value: 'Ermi Mobile Accessories' },
        { key: 'hero_subtitle', value: 'Best And Quality Mobile Accessories' },
        { key: 'location_map_url', value: 'https://maps.google.com/?q=Addis+Ababa,+Ethiopia' }
    ];

    db.get('SELECT COUNT(*) as count FROM settings', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking settings count:', err.message);
            return;
        }

        if (row.count === 0) {
            console.log('📝 No settings found, inserting essential settings...');
            const stmt = db.prepare('INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
            
            essentialSettings.forEach(setting => {
                stmt.run(setting.key, setting.value, (err) => {
                    if (err) {
                        console.error(`❌ Error inserting ${setting.key}:`, err.message);
                    } else {
                        console.log(`✅ ${setting.key} initialized`);
                    }
                });
            });
            
            stmt.finalize(() => {
                console.log('🎉 Essential settings initialized successfully!');
            });
        } else {
            console.log('✅ Settings already exist');
        }
    });
}

// ===== API Routes =====

// Get all products
app.get('/api/products', (req, res) => {
    console.log('📡 GET /api/products - Fetching all products');
    
    const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching products:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            console.log(`✅ Fetched ${rows.length} products`);
            res.json({ products: rows });
        }
    });
});

// Get single product by ID
app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    console.log(`📡 GET /api/products/${id} - Fetching single product`);
    
    const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    `;
    
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('❌ Error fetching product:', err.message);
            res.status(500).json({ error: err.message });
        } else if (!row) {
            console.log(`❌ Product not found: ${id}`);
            res.status(404).json({ error: 'Product not found' });
        } else {
            console.log(`✅ Fetched product: ${row.name}`);
            res.json({ product: row });
        }
    });
});

// Get all categories
app.get('/api/categories', (req, res) => {
    console.log('📡 GET /api/categories - Fetching all categories');
    
    db.all('SELECT * FROM categories ORDER BY parent_id, name', [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching categories:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            console.log(`✅ Fetched ${rows.length} categories`);
            res.json({ categories: rows });
        }
    });
});

// User registration
app.post('/api/register', async (req, res) => {
    console.log('📡 POST /api/register - User registration');
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        console.log('❌ Registration failed: Missing required fields');
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
        console.log('❌ Registration failed: Password too short');
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            'INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, 1)',
            [name, email, hashedPassword, 'user'],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        console.log(`❌ Registration failed: Email already exists - ${email}`);
                        res.status(400).json({ error: 'Email already exists' });
                    } else {
                        console.error('❌ Registration error:', err.message);
                        res.status(500).json({ error: err.message });
                    }
                } else {
                    console.log(`✅ New user registered: ${email}`);
                    res.json({
                        success: true,
                        message: 'Registration successful! You can now login.',
                        userId: this.lastID
                    });
                }
            }
        );
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User login
app.post('/api/login', (req, res) => {
    console.log('📡 POST /api/login - User login');
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('❌ Login failed: Missing credentials');
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error('❌ Login database error:', err.message);
            res.status(500).json({ error: err.message });
        } else if (!user) {
            console.log(`❌ Login failed: User not found - ${email}`);
            res.status(401).json({ error: 'Invalid email or password' });
        } else {
            try {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    console.log(`✅ Login successful: ${email}`);
                    res.json({
                        success: true,
                        message: 'Login successful',
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        }
                    });
                } else {
                    console.log(`❌ Login failed: Invalid password - ${email}`);
                    res.status(401).json({ error: 'Invalid email or password' });
                }
            } catch (error) {
                console.error('❌ Login error:', error);
                res.status(500).json({ error: 'Server error' });
            }
        }
    });
});

// Create order
app.post('/api/orders', (req, res) => {
    console.log('📡 POST /api/orders - Creating order');
    const { userId, items, total, paymentMethod, deliveryAddress, phoneNumber } = req.body;

    if (!items || items.length === 0) {
        console.log('❌ Order failed: Cart is empty');
        return res.status(400).json({ error: 'Cart is empty' });
    }

    db.run(
        'INSERT INTO orders (user_id, total, payment_method, delivery_address, phone_number) VALUES (?, ?, ?, ?, ?)',
        [userId || null, total, paymentMethod || 'cash', deliveryAddress || '', phoneNumber || ''],
        function(err) {
            if (err) {
                console.error('❌ Error creating order:', err.message);
                res.status(500).json({ error: err.message });
            } else {
                const orderId = this.lastID;
                console.log(`✅ Order #${orderId} created - Payment: ${paymentMethod}, Phone: ${phoneNumber}`);

                const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
                items.forEach(item => {
                    stmt.run(orderId, item.id, item.quantity, item.price);
                });
                stmt.finalize();

                res.json({
                    success: true,
                    message: 'Order placed successfully',
                    orderId: orderId
                });
            }
        }
    );
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    console.log('📡 POST /api/contact - Contact form submission');
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        console.log('❌ Contact failed: Missing required fields');
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.run('INSERT INTO contacts (name, email, message, status) VALUES (?, ?, ?, ?)', 
        [name, email, message, 'new'], function(err) {
        if (err) {
            console.error('❌ Error saving contact:', err);
            return res.status(500).json({ error: 'Failed to save contact message' });
        }

        console.log(`✅ Contact form submission saved: ${name} (${email})`);
        res.json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.'
        });
    });
});

// Get all settings
app.get('/api/settings', (req, res) => {
    console.log('📡 GET /api/settings - Fetching settings');
    
    db.all('SELECT * FROM settings', [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching settings:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            const settings = {};
            rows.forEach(row => {
                settings[row.key] = row.value;
            });
            console.log(`✅ Fetched ${rows.length} settings`);
            res.json({ settings });
        }
    });
});

// ===== ADMIN API ROUTES =====

// Create product (admin only)
app.post('/api/admin/products', (req, res) => {
    console.log('📡 POST /api/admin/products - Creating product');
    const { name, price, icon, stock, description, category_id } = req.body;

    if (!name || !price || !icon) {
        console.log('❌ Product creation failed: Missing required fields');
        return res.status(400).json({ error: 'Name, price, and icon are required' });
    }

    db.run(
        'INSERT INTO products (name, price, icon, stock, description, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, price, icon, stock || 100, description || '', category_id || null],
        function(err) {
            if (err) {
                console.error('❌ Error creating product:', err.message);
                res.status(500).json({ error: err.message });
            } else {
                console.log(`✅ Product created: ${name} (ID: ${this.lastID})`);
                res.json({
                    success: true,
                    message: 'Product created successfully',
                    productId: this.lastID
                });
            }
        }
    );
});

// Update product (admin only)
app.put('/api/admin/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, icon, stock, description, category_id } = req.body;

    if (!name || !price || !icon) {
        return res.status(400).json({ error: 'Name, price, and icon are required' });
    }

    db.run(
        'UPDATE products SET name = ?, price = ?, icon = ?, stock = ?, description = ?, category_id = ? WHERE id = ?',
        [name, price, icon, stock || 100, description || '', category_id || null, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                console.log(`✅ Product updated: ${name} (ID: ${id})`);
                res.json({
                    success: true,
                    message: 'Product updated successfully',
                    changes: this.changes
                });
            }
        }
    );
});

// Delete product (admin only)
app.delete('/api/admin/products/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            console.log(`✅ Product deleted: ID ${id}`);
            res.json({
                success: true,
                message: 'Product deleted successfully',
                changes: this.changes
            });
        }
    });
});

// Upload product image
app.post('/api/admin/products/:id/upload', upload.single('image'), (req, res) => {
    const { id } = req.params;
    
    console.log(`📸 Image upload request for product: ${id}`);
    
    if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = useCloudinary ? req.file.path : '/uploads/' + req.file.filename;
    console.log(`✅ File received: ${req.file.filename || req.file.originalname}`);
    console.log(`📁 Image path: ${imagePath}`);

    db.run('UPDATE products SET image = ? WHERE id = ?', [imagePath, id], function(err) {
        if (err) {
            console.log('❌ Database error:', err.message);
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            console.log(`✅ Image uploaded for product: ${id}`);
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                imagePath: imagePath
            });
        }
    });
});

// Get all users (admin only)
app.get('/api/admin/users', (req, res) => {
    db.all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ users: rows });
        }
    });
});

// Get all orders (admin only)
app.get('/api/admin/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ orders: rows });
        }
    });
});

// Get all contacts (admin only)
app.get('/api/admin/contacts', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ contacts: rows });
        }
    });
});

// Update setting (admin only)
app.put('/api/admin/settings/:key', (req, res) => {
    const { key } = req.params;
    const { value } = req.body;

    db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                console.log(`✅ Setting updated: ${key} = ${value}`);
                res.json({
                    success: true,
                    message: 'Setting updated successfully'
                });
            }
        }
    );
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== Start Server =====
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`📱 Access your Ermi Mobile store!`);
});

// ===== Graceful Shutdown =====
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('\n✅ Database connection closed');
        }
        process.exit(0);
    });
});
