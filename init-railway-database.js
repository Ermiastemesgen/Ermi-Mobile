// Initialize Railway Database with all required tables
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const dbPath = process.env.DATABASE_PATH || './emobile.db';

console.log('🔧 Initializing Railway database...');
console.log('📍 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Database connection established');
});

db.serialize(() => {
    // Create all required tables
    console.log('\n📋 Creating tables...');
    
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        email_verified INTEGER DEFAULT 0,
        verification_token TEXT,
        verification_expires INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Users table:', err.message);
        else console.log('✅ Users table created');
    });

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        icon TEXT NOT NULL,
        description TEXT,
        stock INTEGER DEFAULT 100,
        image TEXT,
        category_id INTEGER,
        images TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Products table:', err.message);
        else console.log('✅ Products table created');
    });

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Categories table:', err.message);
        else console.log('✅ Categories table created');
    });

    // Product images table
    db.run(`CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        is_primary INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('❌ Product images table:', err.message);
        else console.log('✅ Product images table created');
    });

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        payment_proof TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('❌ Orders table:', err.message);
        else console.log('✅ Orders table created');
    });

    // Order items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`, (err) => {
        if (err) console.error('❌ Order items table:', err.message);
        else console.log('✅ Order items table created');
    });

    // Settings table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Settings table:', err.message);
        else console.log('✅ Settings table created');
    });

    // Contacts table
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Contacts table:', err.message);
        else console.log('✅ Contacts table created');
    });

    // Create default admin user
    console.log('\n👤 Creating default admin user...');
    
    bcrypt.hash('admin123', 10, (err, hash) => {
        if (err) {
            console.error('❌ Error hashing password:', err.message);
            return;
        }

        db.run(`INSERT OR IGNORE INTO users (name, email, password, role, email_verified) 
                VALUES (?, ?, ?, ?, ?)`,
            ['Admin', 'admin@ermimobile.com', hash, 'admin', 1],
            function(err) {
                if (err) {
                    console.error('❌ Error creating admin:', err.message);
                } else if (this.changes > 0) {
                    console.log('✅ Admin user created');
                    console.log('   Email: admin@ermimobile.com');
                    console.log('   Password: admin123');
                } else {
                    console.log('ℹ️  Admin user already exists');
                }
            }
        );
    });

    // Add default settings
    console.log('\n⚙️  Adding default settings...');
    
    const defaultSettings = [
        ['auto_products_disabled', 'true'],
        ['site_name', 'Ermi Mobile'],
        ['about_us', 'Welcome to Ermi Mobile, your one-stop destination for premium mobile accessories.']
    ];

    const settingsStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    
    defaultSettings.forEach(([key, value]) => {
        settingsStmt.run(key, value, (err) => {
            if (err) console.error(`❌ Setting ${key}:`, err.message);
            else console.log(`✅ Setting: ${key}`);
        });
    });

    settingsStmt.finalize(() => {
        console.log('\n🎉 Database initialization complete!');
        console.log('\n📊 Next steps:');
        console.log('   1. Database is ready');
        console.log('   2. Auto-seed will run on next server start');
        console.log('   3. Products and categories will be imported');
        
        db.close();
    });
});
