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
    
    // Content Security Policy
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' *;"
    );
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
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
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for 4K quality images
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

// ===== Email Configuration =====
// Configure email transporter (optional - won't block if not configured)
let transporter = null;
try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 5000, // 5 second timeout
            greetingTimeout: 5000
        });
        console.log('📧 Email configured (will verify on first use)');
    } else {
        console.log('📧 Email not configured - verification links will be logged to console');
    }
} catch (error) {
    console.log('⚠️  Email setup skipped:', error.message);
}

// Send verification email
const sendVerificationEmail = async (email, token, name) => {
    const websiteUrl = process.env.WEBSITE_URL || `http://localhost:${PORT}`;
    const verificationUrl = `${websiteUrl}/verify-email?token=${token}`;
    
    // Check if email is configured
    if (!transporter || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n📧 EMAIL VERIFICATION LINK (Development Mode):');
        console.log(`User: ${name} (${email})`);
        console.log(`Link: ${verificationUrl}`);
        console.log('Copy this link to verify the email\n');
        console.log('💡 To send real emails, configure EMAIL_USER and EMAIL_PASS in .env file\n');
        return true;
    }
    
    // Send actual email
    try {
        const info = await transporter.sendMail({
            from: `"Ermi Mobile" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - Ermi Mobile',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">📱 Ermi Mobile</h1>
                    </div>
                    <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${name}! 👋</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Thank you for registering with Ermi Mobile. We're excited to have you on board!
                        </p>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            Please verify your email address to complete your registration and start shopping for premium mobile accessories.
                        </p>
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${verificationUrl}" 
                               style="background: #2563eb; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                                ✓ Verify Email Address
                            </a>
                        </div>
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0;">
                                <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all; font-size: 13px;">${verificationUrl}</a>
                            </p>
                        </div>
                        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
                            ⏰ This link will expire in 24 hours for security reasons.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
                            If you didn't create an account with Ermi Mobile, please ignore this email.
                        </p>
                    </div>
                    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                        <p style="margin: 5px 0;">© 2025 Ermi Mobile. All rights reserved.</p>
                        <p style="margin: 5px 0;">Your trusted source for mobile accessories</p>
                    </div>
                </div>
            `
        });
        
        console.log('✅ Verification email sent to:', email);
        console.log('📧 Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        // Fallback to console link
        console.log('\n📧 EMAIL VERIFICATION LINK (Fallback):');
        console.log(`User: ${name} (${email})`);
        console.log(`Link: ${verificationUrl}\n`);
        return false;
    }
};

// ===== Initialize Database =====
const db = new sqlite3.Database('./emobile.db', (err) => {
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
            insertDefaultProducts();
        }
    });

    // Product images table (for multiple images per product)
    db.run(`
        CREATE TABLE IF NOT EXISTS product_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            display_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating product_images table:', err.message);
        } else {
            console.log('✅ Product images table ready');
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
        }
    });

    // Add email verification columns to users table if they don't exist
    db.run(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding email_verified column:', err.message);
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN verification_token TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding verification_token column:', err.message);
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN verification_token_expires DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding verification_token_expires column:', err.message);
        }
    });

    // Sync existing product images to product_images table
    setTimeout(() => {
        syncProductImages();
    }, 1000);
}

// ===== Sync Product Images =====
function syncProductImages() {
    db.all('SELECT id, image FROM products WHERE image IS NOT NULL AND image != ""', [], (err, products) => {
        if (err) {
            console.error('❌ Error syncing product images:', err.message);
            return;
        }

        if (products.length === 0) {
            return;
        }

        let synced = 0;
        products.forEach((product) => {
            // Check if this product already has images in product_images table
            db.get('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?', [product.id], (err, row) => {
                if (err || row.count > 0) {
                    return; // Skip if error or already has images
                }

                // Insert the image into product_images table
                db.run(
                    'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
                    [product.id, product.image, 0],
                    (err) => {
                        if (!err) {
                            synced++;
                        }
                    }
                );
            });
        });

        if (synced > 0) {
            setTimeout(() => {
                console.log(`✅ Synced ${synced} product images to product_images table`);
            }, 500);
        }
    });
}

// ===== Create Default Accounts =====
async function createDefaultAccounts() {
    const defaultAccounts = [
        { name: 'Admin', email: 'admin@ermimobile.com', password: 'admin123', role: 'admin', email_verified: 1 },
        { name: 'Editor User', email: 'editor@ermimobile.com', password: 'editor123', role: 'editor', email_verified: 1 },
        { name: 'Regular User', email: 'user@ermimobile.com', password: 'user123', role: 'user', email_verified: 1 }
    ];

    db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
        if (err) {
            console.error('Error checking users:', err.message);
        } else if (row.count === 0) {
            console.log('Creating default accounts...');
            for (const account of defaultAccounts) {
                try {
                    const hashedPassword = await bcrypt.hash(account.password, 10);
                    db.run(
                        'INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)',
                        [account.name, account.email, hashedPassword, account.role, account.email_verified || 0],
                        (err) => {
                            if (err) {
                                console.error(`Error creating ${account.role}:`, err.message);
                            } else {
                                console.log(`✅ ${account.role.toUpperCase()} account created: ${account.email}`);
                            }
                        }
                    );
                } catch (error) {
                    console.error('Error hashing password:', error);
                }
            }
        }
    });
}

// ===== Insert Default Products =====
function insertDefaultProducts() {
    const products = [
        { name: 'Wireless Earbuds Pro', price: 2500, icon: 'fa-headphones', stock: 50, description: 'Premium wireless earbuds with active noise cancellation and 24-hour battery life' },
        { name: 'Protective Phone Case', price: 500, icon: 'fa-mobile-alt', stock: 100, description: 'Durable protective case with shock absorption for all phone models' },
        { name: 'Fast Charger 20W', price: 800, icon: 'fa-charging-station', stock: 75, description: 'Quick charge adapter with USB-C port and smart charging technology' },
        { name: 'Tempered Glass Screen Protector', price: 300, icon: 'fa-shield-alt', stock: 150, description: '9H hardness tempered glass with oleophobic coating' },
        { name: 'Power Bank 10000mAh', price: 1800, icon: 'fa-battery-full', stock: 40, description: 'Portable power bank with dual USB ports and LED indicator' },
        { name: 'USB-C Cable 2m', price: 400, icon: 'fa-plug', stock: 200, description: 'Durable braided USB-C charging cable with fast data transfer' },
        { name: 'Car Phone Holder', price: 600, icon: 'fa-car', stock: 80, description: 'Universal car phone holder with 360° rotation and strong grip' },
        { name: 'Bluetooth Speaker', price: 3500, icon: 'fa-volume-up', stock: 30, description: 'Portable Bluetooth speaker with deep bass and 12-hour playtime' },
        { name: 'Selfie Stick with Tripod', price: 900, icon: 'fa-camera', stock: 60, description: 'Extendable selfie stick with built-in tripod and Bluetooth remote' },
        { name: 'Phone Ring Holder', price: 250, icon: 'fa-ring', stock: 120, description: '360° rotating ring holder with magnetic car mount compatibility' },
        { name: 'Wireless Charging Pad', price: 1200, icon: 'fa-wifi', stock: 45, description: 'Fast wireless charging pad compatible with all Qi-enabled devices' },
        { name: 'AUX Audio Cable', price: 350, icon: 'fa-headphones-alt', stock: 90, description: '3.5mm auxiliary audio cable with gold-plated connectors' }
    ];

    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
            console.error('Error checking products:', err.message);
        } else if (row.count === 0) {
            console.log('📦 Seeding database with sample products...');
            const stmt = db.prepare('INSERT INTO products (name, price, icon, stock, description) VALUES (?, ?, ?, ?, ?)');
            products.forEach(product => {
                stmt.run(product.name, product.price, product.icon, product.stock, product.description);
            });
            stmt.finalize(() => {
                console.log(`✅ ${products.length} products added automatically`);
            });
        }
    });
}

// ===== API Routes =====

// Get product images
app.get('/api/products/:id/images', (req, res) => {
    const { id } = req.params;
    
    db.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order', [id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ images: rows });
        }
    });
});

// Get all products
app.get('/api/products', (req, res) => {
    const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ products: rows });
        }
    });
});

// Get all categories with hierarchy
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY parent_id, name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ categories: rows });
        }
    });
});

// Get category tree (hierarchical structure)
app.get('/api/categories/tree', (req, res) => {
    db.all('SELECT * FROM categories', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            // Build tree structure
            const buildTree = (parentId = null) => {
                return rows
                    .filter(cat => cat.parent_id === parentId)
                    .map(cat => ({
                        ...cat,
                        children: buildTree(cat.id)
                    }));
            };
            res.json({ tree: buildTree() });
        }
    });
});

// Create category (admin only)
app.post('/api/admin/categories', (req, res) => {
    const { name, description, parent_id } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    db.run(
        'INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)',
        [name, description || '', parent_id || null],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Category already exists' });
                } else {
                    res.status(500).json({ error: err.message });
                }
            } else {
                res.json({
                    success: true,
                    message: 'Category created successfully',
                    categoryId: this.lastID
                });
            }
        }
    );
});

// Update category (admin only)
app.put('/api/admin/categories/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, parent_id } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    // Prevent circular reference
    if (parent_id == id) {
        return res.status(400).json({ error: 'Category cannot be its own parent' });
    }

    db.run(
        'UPDATE categories SET name = ?, description = ?, parent_id = ? WHERE id = ?',
        [name, description || '', parent_id || null, id],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Category name already exists' });
                } else {
                    res.status(500).json({ error: err.message });
                }
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Category not found' });
            } else {
                res.json({
                    success: true,
                    message: 'Category updated successfully'
                });
            }
        }
    );
});

// Upload category image
app.post('/api/admin/categories/:id/upload', upload.single('image'), (req, res) => {
    const { id } = req.params;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = '/uploads/' + req.file.filename;

    db.run(
        'UPDATE categories SET image = ? WHERE id = ?',
        [imagePath, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Category not found' });
            } else {
                res.json({
                    success: true,
                    message: 'Category image uploaded successfully',
                    imagePath: imagePath
                });
            }
        }
    );
});

// Delete category (admin only)
app.delete('/api/admin/categories/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Category not found' });
        } else {
            res.json({
                success: true,
                message: 'Category deleted successfully'
            });
        }
    });
});

// Create product (admin only)
app.post('/api/admin/products', (req, res) => {
    const { name, price, icon, stock, description, category_id } = req.body;

    if (!name || !price || !icon) {
        return res.status(400).json({ error: 'Name, price, and icon are required' });
    }

    db.run(
        'INSERT INTO products (name, price, icon, stock, description, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, price, icon, stock || 100, description || '', category_id || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({
                    success: true,
                    message: 'Product created successfully',
                    productId: this.lastID
                });
            }
        }
    );
});

// User registration
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'user'; // Default to 'user' if no role specified

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Insert user with verification token
        db.run(
            'INSERT INTO users (name, email, password, role, email_verified, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, 0, ?, ?)',
            [name, email, hashedPassword, userRole, verificationToken, tokenExpires.toISOString()],
            async function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        res.status(400).json({ error: 'Email already exists' });
                    } else {
                        res.status(500).json({ error: err.message });
                    }
                } else {
                    // Send verification email
                    const emailSent = await sendVerificationEmail(email, verificationToken, name);
                    
                    res.json({
                        success: true,
                        message: 'Registration successful! Please check your email to verify your account.',
                        userId: this.lastID,
                        emailSent: emailSent
                    });
                }
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// User login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
        } else {
            try {
                // Compare password
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    // Check if email is verified
                    if (!user.email_verified) {
                        return res.status(403).json({ 
                            error: 'Please verify your email before logging in. Check your inbox for the verification link.',
                            emailNotVerified: true
                        });
                    }
                    
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
                    res.status(401).json({ error: 'Invalid email or password' });
                }
            } catch (error) {
                res.status(500).json({ error: 'Server error' });
            }
        }
    });
});

// Email verification endpoint
app.get('/verify-email', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('<h1>Invalid verification link</h1>');
    }

    db.get(
        'SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > datetime("now")',
        [token],
        (err, user) => {
            if (err) {
                return res.status(500).send('<h1>Server error</h1>');
            }
            
            if (!user) {
                return res.send(`
                    <html>
                        <head>
                            <title>Verification Failed</title>
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                                .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                                h1 { color: #ef4444; }
                                a { color: #2563eb; text-decoration: none; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>❌ Verification Failed</h1>
                                <p>This verification link is invalid or has expired.</p>
                                <p><a href="/">Return to homepage</a></p>
                            </div>
                        </body>
                    </html>
                `);
            }

            // Update user as verified
            db.run(
                'UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
                [user.id],
                (err) => {
                    if (err) {
                        return res.status(500).send('<h1>Server error</h1>');
                    }

                    res.send(`
                        <html>
                            <head>
                                <title>Email Verified</title>
                                <style>
                                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                                    .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                                    h1 { color: #10b981; }
                                    a { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
                                    a:hover { background: #1d4ed8; }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <h1>✅ Email Verified!</h1>
                                    <p>Your email has been successfully verified.</p>
                                    <p>You can now log in to your account.</p>
                                    <a href="/">Go to Login</a>
                                </div>
                            </body>
                        </html>
                    `);
                }
            );
        }
    );
});

// Resend verification email
app.post('/api/resend-verification', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.email_verified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        db.run(
            'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
            [verificationToken, tokenExpires.toISOString(), user.id],
            async (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }

                // Send verification email
                const emailSent = await sendVerificationEmail(email, verificationToken, user.name);

                res.json({
                    success: true,
                    message: 'Verification email sent! Please check your inbox.',
                    emailSent: emailSent
                });
            }
        );
    });
});

// Create order
app.post('/api/orders', (req, res) => {
    const { userId, items, total, paymentMethod, deliveryAddress, phoneNumber } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    // Insert order
    db.run(
        'INSERT INTO orders (user_id, total, payment_method, delivery_address, phone_number) VALUES (?, ?, ?, ?, ?)',
        [userId || null, total, paymentMethod || 'cash', deliveryAddress || '', phoneNumber || ''],
        function(err) {
            if (err) {
                console.error('Error creating order:', err.message);
                res.status(500).json({ error: err.message });
            } else {
                const orderId = this.lastID;
                console.log(`✅ Order #${orderId} created - Payment: ${paymentMethod}, Phone: ${phoneNumber}`);

                // Insert order items
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

// Upload payment receipt for order
app.post('/api/orders/:id/receipt', upload.single('receipt'), (req, res) => {
    const { id } = req.params;
    
    console.log('📸 Receipt upload request for order:', id);
    
    if (!req.file) {
        console.log('❌ No receipt file uploaded');
        return res.status(400).json({ error: 'No receipt file uploaded' });
    }

    const receiptPath = '/uploads/' + req.file.filename;
    console.log('✅ Receipt file received:', req.file.filename);
    console.log('📁 Receipt path:', receiptPath);

    db.run(
        'UPDATE orders SET payment_receipt = ? WHERE id = ?',
        [receiptPath, id],
        function(err) {
            if (err) {
                console.log('❌ Database error:', err.message);
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                console.log('❌ Order not found:', id);
                res.status(404).json({ error: 'Order not found' });
            } else {
                console.log('✅ Receipt saved for order:', id);
                res.json({
                    success: true,
                    message: 'Receipt uploaded successfully',
                    receiptPath: receiptPath
                });
            }
        }
    );
});

// Get user orders
app.get('/api/orders/:userId', (req, res) => {
    const userId = req.params.userId;

    db.all(
        `SELECT o.*, 
                GROUP_CONCAT(p.name || ' x' || oi.quantity) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ orders: rows });
            }
        }
    );
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO contacts (name, email, message, status) VALUES (?, ?, ?, ?)';
    db.run(sql, [name, email, message, 'new'], function(err) {
        if (err) {
            console.error('Error saving contact:', err);
            return res.status(500).json({ error: 'Failed to save contact message' });
        }

        console.log('Contact form submission saved:', { id: this.lastID, name, email });
        res.json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.'
        });
    });
});

// ===== Admin API Routes =====

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

// Update contact status (admin only)
app.put('/api/admin/contacts/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.run('UPDATE contacts SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, changes: this.changes });
        }
    });
});

// Delete contact (admin only)
app.delete('/api/admin/contacts/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM contacts WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, changes: this.changes });
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

// Update order status (admin only)
app.put('/api/admin/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected' });
    }

    db.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                console.log('❌ Error updating order status:', err.message);
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Order not found' });
            } else {
                console.log(`✅ Order #${id} status updated to: ${status}`);
                res.json({
                    success: true,
                    message: 'Order status updated successfully',
                    status: status
                });
            }
        }
    );
});

// Delete order (admin only)
app.delete('/api/admin/orders/:id', (req, res) => {
    const { id } = req.params;

    console.log('🗑️ Deleting order:', id);

    // First delete order items
    db.run('DELETE FROM order_items WHERE order_id = ?', [id], function(err) {
        if (err) {
            console.log('❌ Error deleting order items:', err.message);
            return res.status(500).json({ error: err.message });
        }

        console.log(`✅ Deleted ${this.changes} order items`);

        // Then delete the order
        db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
            if (err) {
                console.log('❌ Error deleting order:', err.message);
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Order not found' });
            } else {
                console.log(`✅ Order #${id} deleted successfully`);
                res.json({
                    success: true,
                    message: 'Order deleted successfully'
                });
            }
        });
    });
});

// Get database stats
app.get('/api/admin/stats', (req, res) => {
    const stats = {};
    
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        stats.users = row ? row.count : 0;
        
        db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
            stats.products = row ? row.count : 0;
            
            // Count all orders
            db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
                stats.orders = row ? row.count : 0;
                
                // Calculate revenue only from approved orders
                db.get('SELECT SUM(total) as revenue FROM orders WHERE status = ?', ['approved'], (err, row) => {
                    stats.revenue = row && row.revenue ? row.revenue : 0;
                    res.json(stats);
                });
            });
        });
    });
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
                res.json({
                    success: true,
                    message: 'Product updated successfully',
                    changes: this.changes
                });
            }
        }
    );
});

// Upload multiple product images
app.post('/api/admin/products/:id/upload-multiple', upload.array('images', 10), (req, res) => {
    const { id } = req.params;
    
    console.log('📸 Multiple images upload for product:', id);
    
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
    }

    const newImagePaths = req.files.map(file => '/uploads/' + file.filename);
    console.log('✅ Files received:', req.files.length);

    // Get existing images from product_images table
    db.all('SELECT image_url, display_order FROM product_images WHERE product_id = ? ORDER BY display_order', [id], (err, existingImages) => {
        if (err) {
            console.log('❌ Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        // Calculate starting display order
        const startOrder = existingImages.length;
        
        // Insert new images into product_images table
        const stmt = db.prepare('INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)');
        
        newImagePaths.forEach((path, index) => {
            stmt.run(id, path, startOrder + index);
        });
        
        stmt.finalize((err) => {
            if (err) {
                console.log('❌ Database error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            
            // Get all images for this product
            db.all('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order', [id], (err, allImages) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                const allImagePaths = allImages.map(img => img.image_url);
                
                // Update the main product image and images JSON
                db.run('UPDATE products SET image = ?, images = ? WHERE id = ?', 
                    [allImagePaths[0], JSON.stringify(allImagePaths), id], (err) => {
                        if (err) {
                            console.log('❌ Error updating product:', err.message);
                        }
                        
                        console.log('✅ Images saved to database');
                        res.json({
                            success: true,
                            message: `${newImagePaths.length} images uploaded successfully`,
                            imagePaths: newImagePaths,
                            totalImages: allImagePaths.length
                        });
                    });
            });
        });
    });
});

// Upload product image (single - adds to existing images)
app.post('/api/admin/products/:id/upload', upload.single('image'), (req, res) => {
    const { id } = req.params;
    
    console.log('📸 Image upload request for product:', id);
    
    if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = '/uploads/' + req.file.filename;
    console.log('✅ File received:', req.file.filename);
    console.log('📁 Image path:', imagePath);

    // Get existing images to calculate display order
    db.all('SELECT image_url, display_order FROM product_images WHERE product_id = ? ORDER BY display_order', [id], (err, existingImages) => {
        if (err) {
            console.log('❌ Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        const displayOrder = existingImages.length;
        
        // Insert new image into product_images table
        db.run('INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)', 
            [id, imagePath, displayOrder], (err) => {
                if (err) {
                    console.log('❌ Database error:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                // Get all images for this product
                db.all('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order', [id], (err, allImages) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    
                    const allImagePaths = allImages.map(img => img.image_url);
                    
                    // Update the main product image (first image) and images JSON
                    db.run('UPDATE products SET image = ?, images = ? WHERE id = ?', 
                        [allImagePaths[0], JSON.stringify(allImagePaths), id], (err) => {
                            if (err) {
                                console.log('❌ Error updating product:', err.message);
                            }
                            
                            console.log('✅ Image added to product:', id);
                            res.json({
                                success: true,
                                message: 'Image uploaded successfully',
                                imagePath: imagePath,
                                totalImages: allImagePaths.length
                            });
                        });
                });
            });
    });
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
            res.json({
                success: true,
                message: 'Product deleted successfully',
                changes: this.changes
            });
        }
    });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all settings
app.get('/api/settings', (req, res) => {
    db.all('SELECT * FROM settings', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const settings = {};
            rows.forEach(row => {
                settings[row.key] = row.value;
            });
            res.json({ settings });
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
                res.json({
                    success: true,
                    message: 'Setting updated successfully'
                });
            }
        }
    );
});

// Upload hero background image
app.post('/api/admin/settings/hero-image/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = '/uploads/' + req.file.filename;

    db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        ['hero_background_image', imagePath],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({
                    success: true,
                    message: 'Hero image uploaded successfully',
                    imagePath: imagePath
                });
            }
        }
    );
});

// Serve admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ===== Manual Seed Endpoint (for free tier without shell access) =====
app.get('/seed-database-now', async (req, res) => {
    try {
        // Check if already seeded
        db.get('SELECT COUNT(*) as count FROM products', async (err, row) => {
            if (err) {
                return res.status(500).send(`<h1>Error: ${err.message}</h1>`);
            }
            
            if (row.count > 0) {
                return res.send(`
                    <html>
                        <head><title>Already Seeded</title></head>
                        <body style="font-family: Arial; text-align: center; padding: 50px;">
                            <h1>✅ Database Already Has Products!</h1>
                            <p>Found ${row.count} products in database.</p>
                            <p><a href="/">Go to Website</a> | <a href="/admin-simple.html">Go to Admin</a></p>
                        </body>
                    </html>
                `);
            }
            
            // Seed products
            const products = [
                { name: 'Wireless Earbuds Pro', price: 2500, icon: 'fa-headphones', stock: 50, description: 'Premium wireless earbuds' },
                { name: 'Phone Case', price: 500, icon: 'fa-mobile-alt', stock: 100, description: 'Protective phone case' },
                { name: 'Fast Charger', price: 800, icon: 'fa-charging-station', stock: 75, description: 'Quick charge adapter' },
                { name: 'Screen Protector', price: 300, icon: 'fa-shield-alt', stock: 150, description: 'Tempered glass' },
                { name: 'Power Bank', price: 1800, icon: 'fa-battery-full', stock: 40, description: 'Portable power bank' },
                { name: 'USB Cable', price: 400, icon: 'fa-plug', stock: 200, description: 'USB-C cable' },
                { name: 'Car Holder', price: 600, icon: 'fa-car', stock: 80, description: 'Car phone holder' },
                { name: 'Bluetooth Speaker', price: 3500, icon: 'fa-volume-up', stock: 30, description: 'Portable speaker' },
                { name: 'Selfie Stick', price: 900, icon: 'fa-camera', stock: 60, description: 'Selfie stick with tripod' },
                { name: 'Ring Holder', price: 250, icon: 'fa-ring', stock: 120, description: 'Phone ring holder' },
                { name: 'Wireless Charger', price: 1200, icon: 'fa-wifi', stock: 45, description: 'Wireless charging pad' },
                { name: 'AUX Cable', price: 350, icon: 'fa-headphones-alt', stock: 90, description: 'Audio cable' }
            ];
            
            // Create admin if doesn't exist
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.run(
                'INSERT OR IGNORE INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)',
                ['Admin', 'admin@ermimobile.com', hashedPassword, 'admin', 1]
            );
            
            // Insert products
            const stmt = db.prepare('INSERT INTO products (name, price, icon, stock, description) VALUES (?, ?, ?, ?, ?)');
            products.forEach(p => {
                stmt.run(p.name, p.price, p.icon, p.stock, p.description);
            });
            stmt.finalize(() => {
                res.send(`
                    <html>
                        <head><title>Database Seeded!</title></head>
                        <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0f9ff;">
                            <h1 style="color: #10b981;">🎉 Database Seeded Successfully!</h1>
                            <p style="font-size: 18px;">Added ${products.length} products and admin account</p>
                            <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 10px; display: inline-block;">
                                <h3>Admin Login:</h3>
                                <p><strong>Email:</strong> admin@ermimobile.com</p>
                                <p><strong>Password:</strong> admin123</p>
                            </div>
                            <div style="margin-top: 30px;">
                                <a href="/" style="display: inline-block; padding: 15px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 10px;">
                                    🏠 Go to Website
                                </a>
                                <a href="/admin-simple.html" style="display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 10px;">
                                    👤 Go to Admin Panel
                                </a>
                            </div>
                        </body>
                    </html>
                `);
            });
        });
    } catch (error) {
        res.status(500).send(`<h1>Error: ${error.message}</h1>`);
    }
});

// ===== Start Server =====
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Ermi Mobile Server is running!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`💾 Database: emobile.db`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\nAPI Endpoints:`);
    console.log(`  GET  /api/products`);
    console.log(`  POST /api/register`);
    console.log(`  POST /api/login`);
    console.log(`  POST /api/orders`);
    console.log(`  GET  /api/orders/:userId`);
    console.log(`  POST /api/contact\n`);
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
