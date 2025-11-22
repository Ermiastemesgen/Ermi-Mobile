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
    
    // Content Security Policy
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: blob: https: http:; connect-src 'self' *;"
    );
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Create uploads directory if it doesn't exist (for local fallback)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
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
    console.log('📁 Using local file storage (images will be temporary on Render)');
}

// Configure multer storage (Cloudinary or local)
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
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            },
            connectionTimeout: 10000, // 10 second timeout
            greetingTimeout: 10000,
            socketTimeout: 10000
        });
        console.log('📧 Email configured with SMTP settings');
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

    // Add images column to products table if it doesn't exist
    db.run(`ALTER TABLE products ADD COLUMN images TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding images column:', err.message);
        } else if (!err) {
            console.log('✅ Added images column to products table');
        }
    });

    // Add category_id column to products table if it doesn't exist
    db.run(`ALTER TABLE products ADD COLUMN category_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding category_id column:', err.message);
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

// ===== Ensure Main Admin Account =====
async function ensureMainAdmin() {
    const mainAdmin = {
        name: 'Ermias',
        email: 'ermias616@gmail.com',
        password: 'Ermi@0211',
        role: 'admin'
    };

    // Check if account exists
    db.get('SELECT * FROM users WHERE email = ?', [mainAdmin.email], async (err, user) => {
        if (err) {
            console.error('Error checking main admin:', err.message);
            return;
        }

        try {
            const hashedPassword = await bcrypt.hash(mainAdmin.password, 10);

            if (!user) {
                // Create account if doesn't exist
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
                // Update to admin if not already
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
        } catch (error) {
            console.error('Error processing main admin:', error);
        }
    });
}

// ===== Create Default Accounts =====
async function createDefaultAccounts() {
    // Ensure main admin account first
    ensureMainAdmin();

    const defaultAccounts = [
        { name: 'Admin', email: 'old-admin@ermimobile.com', password: 'admin123', role: 'admin', email_verified: 1 },
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
// DISABLED: Auto-seeding disabled - add products manually via admin panel
function insertDefaultProducts() {
    // Automatic product seeding is disabled
    // Add your own products via the admin panel
    console.log('ℹ️  Auto-seeding disabled - add products manually via admin panel');
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

// Get single product by ID
app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    `;
    db.get(query, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json({ product: row });
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

    const imagePath = useCloudinary ? req.file.path : '/uploads/' + req.file.filename;

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'user'; // Default to 'user' if no role specified

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Insert user with auto-verification (email verification disabled due to SMTP issues)
        db.run(
            'INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, 1)',
            [name, email, hashedPassword, userRole],
            async function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        res.status(400).json({ error: 'Email already exists' });
                    } else {
                        res.status(500).json({ error: err.message });
                    }
                } else {
                    console.log(`✅ New user registered and auto-verified: ${email}`);
                    
                    res.json({
                        success: true,
                        message: 'Registration successful! You can now login.',
                        userId: this.lastID
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

    const receiptPath = useCloudinary ? req.file.path : '/uploads/' + req.file.filename;
    console.log('✅ Receipt file received:', req.file.filename || req.file.originalname);
    console.log('📁 Receipt path:', receiptPath);
    console.log('☁️  Storage:', useCloudinary ? 'Cloudinary' : 'Local');

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

// Delete user (admin only)
app.delete('/api/admin/users/:id', (req, res) => {
    const userId = req.params.id;
    
    // First check if user is admin (prevent deleting admin users)
    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }
        
        // Delete the user
        db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'User deleted successfully', deletedId: userId });
            }
        });
    });
});

// Change user role (admin only)
app.put('/api/admin/users/:id/role', (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;
    
    // Validate role
    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }
    
    // Check if user exists
    db.get('SELECT id, name, email FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update user role
        db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ 
                    message: 'User role updated successfully', 
                    userId: userId,
                    newRole: role 
                });
            }
        });
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

// Import products from export file (admin only)
app.get('/api/admin/import-products', async (req, res) => {
    const exportFile = path.join(__dirname, 'products-export.json');
    
    // Check if file exists
    if (!fs.existsSync(exportFile)) {
        return res.status(404).json({ 
            error: 'Export file not found',
            message: 'Please create products-export.json first by running export-products.js locally'
        });
    }

    try {
        const data = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
        const products = data.products;
        const imagesByProduct = data.images;

        let imported = 0;
        let skipped = 0;
        let imagesImported = 0;

        for (const product of products) {
            await new Promise((resolve) => {
                db.get('SELECT id FROM products WHERE name = ?', [product.name], (err, existing) => {
                    if (existing) {
                        skipped++;
                        resolve();
                        return;
                    }

                    db.run(
                        'INSERT INTO products (name, price, icon, stock, description, category_id, image, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [product.name, product.price, product.icon, product.stock, product.description, product.category_id, product.image, product.images],
                        function(err) {
                            if (err) {
                                console.error('Error importing product:', err.message);
                                resolve();
                                return;
                            }

                            const newProductId = this.lastID;
                            imported++;

                            const images = imagesByProduct[product.id] || [];
                            if (images.length > 0) {
                                const stmt = db.prepare('INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)');
                                images.forEach(img => {
                                    stmt.run(newProductId, img.image_url, img.display_order);
                                    imagesImported++;
                                });
                                stmt.finalize();
                            }

                            resolve();
                        }
                    );
                });
            });
        }

        res.json({
            success: true,
            message: 'Products imported successfully',
            imported: imported,
            skipped: skipped,
            imagesImported: imagesImported,
            total: products.length
        });

    } catch (error) {
        res.status(500).json({ error: 'Import failed', message: error.message });
    }
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

    // Get image paths (Cloudinary URL or local path)
    const newImagePaths = req.files.map(file => {
        if (useCloudinary) {
            console.log('☁️  Cloudinary file object:', {
                path: file.path,
                filename: file.filename,
                originalname: file.originalname
            });
            return file.path; // Cloudinary returns full URL in file.path
        } else {
            return '/uploads/' + file.filename; // Local path
        }
    });
    console.log('✅ Files received:', req.files.length);
    console.log('📁 Storage type:', useCloudinary ? 'Cloudinary' : 'Local');
    console.log('🖼️  Image paths:', newImagePaths);

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
                        console.log('📸 Product image updated:', allImagePaths[0]);
                        console.log('📦 Total images for product:', allImagePaths.length);
                        
                        res.json({
                            success: true,
                            message: `${newImagePaths.length} images uploaded successfully`,
                            imagePaths: newImagePaths,
                            totalImages: allImagePaths.length,
                            mainImage: allImagePaths[0]
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

    // Get image path (Cloudinary URL or local path)
    const imagePath = useCloudinary ? req.file.path : '/uploads/' + req.file.filename;
    console.log('✅ File received:', req.file.filename || req.file.originalname);
    console.log('📁 Image path:', imagePath);
    console.log('☁️  Storage:', useCloudinary ? 'Cloudinary' : 'Local');

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

// Update product main image (replaces the main image)
app.post('/api/admin/products/:id/main-image', upload.single('image'), (req, res) => {
    const { id } = req.params;
    
    console.log('🖼️  Main image update request for product:', id);
    
    if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = useCloudinary ? req.file.path : '/uploads/' + req.file.filename;
    console.log('✅ New main image:', imagePath);

    // Get the first image (display_order = 0) for this product
    db.get('SELECT id FROM product_images WHERE product_id = ? ORDER BY display_order LIMIT 1', [id], (err, firstImage) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (firstImage) {
            // Update existing first image
            db.run('UPDATE product_images SET image_url = ? WHERE id = ?', [imagePath, firstImage.id], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                // Update product table
                db.run('UPDATE products SET image = ? WHERE id = ?', [imagePath, id], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    
                    console.log('✅ Main image updated for product:', id);
                    res.json({ success: true, message: 'Main image updated successfully', imagePath });
                });
            });
        } else {
            // Insert new first image
            db.run('INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 0)', 
                [id, imagePath], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    
                    // Update product table
                    db.run('UPDATE products SET image = ? WHERE id = ?', [imagePath, id], (err) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        
                        console.log('✅ Main image added for product:', id);
                        res.json({ success: true, message: 'Main image added successfully', imagePath });
                    });
                });
        }
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

// Delete single product image (admin only)
app.delete('/api/admin/products/images/:imageId', (req, res) => {
    const { imageId } = req.params;

    console.log('🗑️ Deleting product image:', imageId);

    // Get image info before deleting
    db.get('SELECT * FROM product_images WHERE id = ?', [imageId], (err, image) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const productId = image.product_id;

        // Delete the image from product_images table
        db.run('DELETE FROM product_images WHERE id = ?', [imageId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            console.log('✅ Image deleted from product_images table');

            // Update the main product image and images JSON
            db.all('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order', [productId], (err, remainingImages) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                const imageUrls = remainingImages.map(img => img.image_url);
                const mainImage = imageUrls.length > 0 ? imageUrls[0] : null;

                // Update product with new image list
                db.run('UPDATE products SET image = ?, images = ? WHERE id = ?', 
                    [mainImage, JSON.stringify(imageUrls), productId], (err) => {
                        if (err) {
                            console.log('❌ Error updating product:', err.message);
                        }

                        console.log('✅ Product images updated');
                        res.json({
                            success: true,
                            message: 'Image deleted successfully',
                            remainingImages: imageUrls.length
                        });
                    });
            });
        });
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

    const imagePath = useCloudinary ? req.file.path : '/uploads/' + req.file.filename;

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

// ===== Manual Seed Endpoint (DISABLED) =====
app.get('/seed-database-now', async (req, res) => {
    res.send(`
        <html>
            <head><title>Seeding Disabled</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0f9ff;">
                <h1 style="color: #ef4444;">🚫 Automatic Seeding Disabled</h1>
                <p style="font-size: 18px; margin: 20px 0;">This endpoint has been disabled for security.</p>
                <p style="font-size: 16px; color: #6b7280;">Please add products manually through the admin panel.</p>
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

// Debug endpoint to check product images
app.get('/api/debug/products/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        db.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order', [id], (err, images) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({
                product: product,
                images: images,
                cloudinaryEnabled: useCloudinary,
                cloudinaryConfig: useCloudinary ? {
                    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                    configured: true
                } : null
            });
        });
    });
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
