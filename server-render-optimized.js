
// ===== RENDER-OPTIMIZED SERVER FOR ERMI MOBILE =====
require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// ===== Initialize Express App =====
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Render-Specific Configuration =====
const isRender = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
console.log('🌐 Environment:', isRender ? 'Render Production' : 'Local Development');

// ===== CORS Configuration - Render Optimized =====
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Allow all origins in production (Render)
        if (isRender) return callback(null, true);
        
        // Allow localhost in development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        // Allow Render domains
        if (origin.includes('onrender.com')) {
            return callback(null, true);
        }
        
        return callback(null, true); // Allow all for now
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ===== Security Headers for Render =====
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// ===== Static Files - Render Optimized =====
app.use(express.static(__dirname, {
    maxAge: isRender ? '1d' : 0,
    etag: true,
    lastModified: true
}));

// ===== Database Configuration - Render Optimized =====
const dbPath = isRender ? '/tmp/emobile.db' : './emobile.db';
console.log('📁 Database path:', dbPath);

let db;
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Database connection error:', err.message);
                reject(err);
            } else {
                console.log('✅ Connected to SQLite database');
                createTables().then(resolve).catch(reject);
            }
        });
    });
}

async function createTables() {
    console.log('🔧 Creating database tables...');
    
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            email_verified INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS products (
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
        )`,
        `CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            parent_id INTEGER,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS orders (
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
        )`,
        `CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`,
        `CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];
    
    for (const table of tables) {
        await new Promise((resolve, reject) => {
            db.run(table, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    
    console.log('✅ All tables created successfully');
    await createDefaultData();
}

async function createDefaultData() {
    console.log('🔧 Creating default data...');
    
    // Create admin user
    const adminEmail = 'ermias616@gmail.com';
    const adminPassword = 'Ermi@0211';
    
    try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [adminEmail], (err, user) => {
                if (err) reject(err);
                else if (!user) {
                    db.run(
                        'INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, 1)',
                        ['Ermias', adminEmail, hashedPassword, 'admin'],
                        (err) => {
                            if (err) reject(err);
                            else {
                                console.log('✅ Admin user created');
                                resolve();
                            }
                        }
                    );
                } else {
                    console.log('✅ Admin user already exists');
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
    
    // Create default settings
    const defaultSettings = [
        { key: 'about_text', value: 'Welcome to Ermi Mobile, your one-stop destination for premium mobile accessories. We pride ourselves on offering high-quality products at competitive prices. From the latest wireless earbuds to durable phone cases and fast chargers, we have everything you need to enhance your mobile experience. Our commitment to customer satisfaction and product excellence has made us a trusted name in mobile accessories. Shop with confidence and discover the perfect accessories for your devices today!' },
        { key: 'site_name', value: 'Ermi Mobile' },
        { key: 'hero_title', value: 'Ermi Mobile Accessories' },
        { key: 'hero_subtitle', value: 'Best And Quality Mobile Accessories' }
    ];
    
    for (const setting of defaultSettings) {
        await new Promise((resolve) => {
            db.run(
                'INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
                [setting.key, setting.value],
                () => resolve()
            );
        });
    }
    
    // Create sample products if none exist
    await new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
            if (!err && row.count === 0) {
                const sampleProducts = [
                    { name: 'Wireless Earbuds Pro', price: 2500, icon: '🎧', description: 'Premium wireless earbuds with noise cancellation' },
                    { name: 'Fast Charger 65W', price: 800, icon: '⚡', description: 'Ultra-fast charging adapter for all devices' },
                    { name: 'Phone Case Premium', price: 450, icon: '📱', description: 'Durable protection for your smartphone' },
                    { name: 'Power Bank 20000mAh', price: 1200, icon: '🔋', description: 'High-capacity portable charger' },
                    { name: 'Bluetooth Speaker', price: 1800, icon: '🔊', description: 'Portable speaker with excellent sound quality' }
                ];
                
                const stmt = db.prepare('INSERT INTO products (name, price, icon, description, stock) VALUES (?, ?, ?, ?, 100)');
                sampleProducts.forEach(product => {
                    stmt.run(product.name, product.price, product.icon, product.description);
                });
                stmt.finalize();
                console.log('✅ Sample products created');
            }
            resolve();
        });
    });
    
    console.log('✅ Default data initialization complete');
}

// ===== API Routes =====

// Health check for Render
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all products
app.get('/api/products', (req, res) => {
    console.log('📡 GET /api/products');
    
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

// Get all categories
app.get('/api/categories', (req, res) => {
    console.log('📡 GET /api/categories');
    
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
    console.log('📡 POST /api/register');
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
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
                        res.status(400).json({ error: 'Email already exists' });
                    } else {
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
    console.log('📡 POST /api/login');
    const { email, password } = req.body;

    if (!email || !password) {
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

// Contact form submission
app.post('/api/contact', (req, res) => {
    console.log('📡 POST /api/contact');
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
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
    console.log('📡 GET /api/settings');
    
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

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Serve index.html for all other routes
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== Error Handling =====
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ===== Start Server =====
async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Ermi Mobile Server running on port ${PORT}`);
            console.log(`🌐 Environment: ${isRender ? 'Production (Render)' : 'Development'}`);
            console.log(`📱 Access your store at: ${isRender ? 'https://ermi-mobile.onrender.com' : 'http://localhost:' + PORT}`);
            console.log(`👨‍💼 Admin panel: ${isRender ? 'https://ermi-mobile.onrender.com/admin.html' : 'http://localhost:' + PORT + '/admin.html'}`);
            console.log(`🔑 Admin login: ermias616@gmail.com / Ermi@0211`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// ===== Graceful Shutdown =====
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down gracefully...');
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
            } else {
                console.log('✅ Database connection closed');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', () => {
    console.log('🔄 Received SIGTERM, shutting down gracefully...');
    if (db) {
        db.close(() => {
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Start the server
startServer();
