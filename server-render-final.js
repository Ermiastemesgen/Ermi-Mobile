
// ULTRA-SIMPLE RENDER SERVER - GUARANTEED TO WORK
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Ermi Mobile Server...');

// Basic middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// Database setup
const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/emobile.db' : './emobile.db';
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
    } else {
        console.log('✅ Database connected');
        initializeDatabase();
    }
});

function initializeDatabase() {
    console.log('🔧 Initializing database...');
    
    // Create tables
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Users table error:', err);
            else console.log('✅ Users table ready');
        });

        // Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            icon TEXT NOT NULL,
            description TEXT,
            stock INTEGER DEFAULT 100,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Products table error:', err);
            else console.log('✅ Products table ready');
        });

        // Settings table
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Settings table error:', err);
            else console.log('✅ Settings table ready');
        });

        // Contacts table
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Contacts table error:', err);
            else console.log('✅ Contacts table ready');
        });

        // Create admin user
        setTimeout(() => {
            createAdminUser();
            createSampleData();
        }, 1000);
    });
}

function createAdminUser() {
    const adminEmail = 'ermias616@gmail.com';
    const adminPassword = 'Ermi@0211';
    
    bcrypt.hash(adminPassword, 10, (err, hash) => {
        if (err) {
            console.error('❌ Admin hash error:', err);
            return;
        }
        
        db.run('INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Ermias', adminEmail, hash, 'admin'], function(err) {
            if (err) {
                console.error('❌ Admin creation error:', err);
            } else {
                console.log('✅ Admin user ready:', adminEmail);
            }
        });
    });
}

function createSampleData() {
    // Sample products
    const products = [
        { name: 'Wireless Earbuds Pro', price: 2500, icon: '🎧', description: 'Premium wireless earbuds with noise cancellation' },
        { name: 'Fast Charger 65W', price: 800, icon: '⚡', description: 'Ultra-fast charging adapter for all devices' },
        { name: 'Phone Case Premium', price: 450, icon: '📱', description: 'Durable protection for your smartphone' },
        { name: 'Power Bank 20000mAh', price: 1200, icon: '🔋', description: 'High-capacity portable charger' },
        { name: 'Bluetooth Speaker', price: 1800, icon: '🔊', description: 'Portable speaker with excellent sound quality' },
        { name: 'Wireless Mouse', price: 600, icon: '🖱️', description: 'Ergonomic wireless mouse for productivity' },
        { name: 'USB-C Cable', price: 200, icon: '🔌', description: 'High-speed USB-C charging cable' },
        { name: 'Screen Protector', price: 150, icon: '🛡️', description: 'Tempered glass screen protection' },
        { name: 'Car Mount', price: 350, icon: '🚗', description: 'Secure phone mount for vehicles' }
    ];

    db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (!err && row.count === 0) {
            const stmt = db.prepare('INSERT INTO products (name, price, icon, description, stock) VALUES (?, ?, ?, ?, 100)');
            products.forEach(product => {
                stmt.run(product.name, product.price, product.icon, product.description);
            });
            stmt.finalize(() => {
                console.log(`✅ Created ${products.length} sample products`);
            });
        }
    });

    // Sample settings
    const settings = [
        { key: 'about_text', value: 'Welcome to Ermi Mobile, your one-stop destination for premium mobile accessories. We pride ourselves on offering high-quality products at competitive prices. From the latest wireless earbuds to durable phone cases and fast chargers, we have everything you need to enhance your mobile experience.' },
        { key: 'site_name', value: 'Ermi Mobile' },
        { key: 'hero_title', value: 'Ermi Mobile Accessories' },
        { key: 'hero_subtitle', value: 'Best And Quality Mobile Accessories' }
    ];

    db.get('SELECT COUNT(*) as count FROM settings', [], (err, row) => {
        if (!err && row.count === 0) {
            const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
            settings.forEach(setting => {
                stmt.run(setting.key, setting.value);
            });
            stmt.finalize(() => {
                console.log(`✅ Created ${settings.length} settings`);
            });
        }
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.get('/api/products', (req, res) => {
    console.log('📡 GET /api/products');
    
    db.all('SELECT * FROM products ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            console.error('❌ Products error:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            console.log(`✅ Returning ${rows.length} products`);
            res.json({ products: rows });
        }
    });
});

app.get('/api/settings', (req, res) => {
    console.log('📡 GET /api/settings');
    
    db.all('SELECT * FROM settings', [], (err, rows) => {
        if (err) {
            console.error('❌ Settings error:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            const settings = {};
            rows.forEach(row => {
                settings[row.key] = row.value;
            });
            console.log(`✅ Returning ${rows.length} settings`);
            res.json({ settings });
        }
    });
});

app.post('/api/login', (req, res) => {
    console.log('📡 POST /api/login');
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error('❌ Login error:', err.message);
            res.status(500).json({ error: err.message });
        } else if (!user) {
            console.log(`❌ User not found: ${email}`);
            res.status(401).json({ error: 'Invalid email or password' });
        } else {
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) {
                    console.error('❌ Password compare error:', err);
                    res.status(500).json({ error: 'Server error' });
                } else if (match) {
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
                    console.log(`❌ Invalid password: ${email}`);
                    res.status(401).json({ error: 'Invalid email or password' });
                }
            });
        }
    });
});

app.post('/api/register', (req, res) => {
    console.log('📡 POST /api/register');
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('❌ Registration hash error:', err);
            res.status(500).json({ error: 'Server error' });
        } else {
            db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hash, 'user'], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        res.status(400).json({ error: 'Email already exists' });
                    } else {
                        console.error('❌ Registration error:', err.message);
                        res.status(500).json({ error: err.message });
                    }
                } else {
                    console.log(`✅ User registered: ${email}`);
                    res.json({
                        success: true,
                        message: 'Registration successful! You can now login.',
                        userId: this.lastID
                    });
                }
            });
        }
    });
});

app.post('/api/contact', (req, res) => {
    console.log('📡 POST /api/contact');
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.run('INSERT INTO contacts (name, email, message, status) VALUES (?, ?, ?, ?)', 
        [name, email, message, 'new'], function(err) {
        if (err) {
            console.error('❌ Contact error:', err);
            return res.status(500).json({ error: 'Failed to save contact message' });
        }

        console.log(`✅ Contact saved: ${name} (${email})`);
        res.json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.'
        });
    });
});

// Serve static files and handle SPA routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Ermi Mobile Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Admin: ermias616@gmail.com / Ermi@0211`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Received SIGTERM, shutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});
