const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSING RENDER DEPLOYMENT ISSUES');
console.log('=====================================');

function checkCurrentFiles() {
    console.log('\n📁 Checking current files...');
    
    const criticalFiles = [
        'server.js',
        'package.json', 
        'index.html',
        'script.js',
        'render.yaml'
    ];
    
    criticalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
        } else {
            console.log(`❌ ${file} MISSING`);
        }
    });
}

function checkPackageJson() {
    console.log('\n📦 Checking package.json...');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        console.log(`✅ Name: ${packageJson.name}`);
        console.log(`✅ Main: ${packageJson.main}`);
        console.log(`✅ Start script: ${packageJson.scripts?.start || 'MISSING'}`);
        
        const requiredDeps = ['express', 'sqlite3', 'bcrypt', 'cors'];
        requiredDeps.forEach(dep => {
            if (packageJson.dependencies?.[dep]) {
                console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
            } else {
                console.log(`❌ ${dep}: MISSING`);
            }
        });
        
        if (packageJson.engines?.node) {
            console.log(`✅ Node version: ${packageJson.engines.node}`);
        } else {
            console.log(`❌ Node version: NOT SPECIFIED`);
        }
        
    } catch (error) {
        console.log(`❌ Error reading package.json: ${error.message}`);
    }
}

function checkServerJs() {
    console.log('\n🖥️ Checking server.js...');
    
    try {
        const serverContent = fs.readFileSync('server.js', 'utf8');
        
        // Check for critical components
        const checks = [
            { name: 'Express import', pattern: /require\(['"]express['"]\)/ },
            { name: 'PORT configuration', pattern: /PORT.*process\.env\.PORT/ },
            { name: 'Database setup', pattern: /sqlite3/ },
            { name: 'CORS setup', pattern: /cors/ },
            { name: 'Static files', pattern: /express\.static/ },
            { name: 'API routes', pattern: /\/api\// },
            { name: 'Server listen', pattern: /app\.listen/ },
            { name: 'Health check', pattern: /\/health/ }
        ];
        
        checks.forEach(check => {
            if (check.pattern.test(serverContent)) {
                console.log(`✅ ${check.name}`);
            } else {
                console.log(`❌ ${check.name}: MISSING`);
            }
        });
        
    } catch (error) {
        console.log(`❌ Error reading server.js: ${error.message}`);
    }
}

function checkRenderYaml() {
    console.log('\n🔧 Checking render.yaml...');
    
    if (fs.existsSync('render.yaml')) {
        try {
            const renderYaml = fs.readFileSync('render.yaml', 'utf8');
            console.log('✅ render.yaml exists');
            console.log('Content:');
            console.log(renderYaml);
        } catch (error) {
            console.log(`❌ Error reading render.yaml: ${error.message}`);
        }
    } else {
        console.log('❌ render.yaml MISSING');
    }
}

function createRenderFix() {
    console.log('\n🔧 Creating comprehensive Render fix...');
    
    // Create ultra-simple server for Render
    const renderServer = `
// ULTRA-SIMPLE RENDER SERVER FOR ERMI MOBILE
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database
const db = new sqlite3.Database('/tmp/emobile.db');

// Initialize database
db.serialize(() => {
    // Users table
    db.run(\`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )\`);

    // Products table
    db.run(\`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        icon TEXT NOT NULL,
        description TEXT,
        stock INTEGER DEFAULT 100
    )\`);

    // Settings table
    db.run(\`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT
    )\`);

    // Contacts table
    db.run(\`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )\`);

    // Create admin user
    const adminEmail = 'ermias616@gmail.com';
    const adminPassword = 'Ermi@0211';
    
    bcrypt.hash(adminPassword, 10, (err, hash) => {
        if (!err) {
            db.run('INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Ermias', adminEmail, hash, 'admin']);
        }
    });

    // Create sample products
    const products = [
        { name: 'Wireless Earbuds Pro', price: 2500, icon: '🎧', description: 'Premium wireless earbuds' },
        { name: 'Fast Charger 65W', price: 800, icon: '⚡', description: 'Ultra-fast charging adapter' },
        { name: 'Phone Case Premium', price: 450, icon: '📱', description: 'Durable phone protection' },
        { name: 'Power Bank 20000mAh', price: 1200, icon: '🔋', description: 'High-capacity portable charger' },
        { name: 'Bluetooth Speaker', price: 1800, icon: '🔊', description: 'Portable speaker with great sound' }
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO products (name, price, icon, description, stock) VALUES (?, ?, ?, ?, 100)');
    products.forEach(product => {
        stmt.run(product.name, product.price, product.icon, product.description);
    });
    stmt.finalize();

    // Create settings
    const settings = [
        { key: 'about_text', value: 'Welcome to Ermi Mobile, your one-stop destination for premium mobile accessories.' },
        { key: 'site_name', value: 'Ermi Mobile' },
        { key: 'hero_title', value: 'Ermi Mobile Accessories' },
        { key: 'hero_subtitle', value: 'Best And Quality Mobile Accessories' }
    ];

    const settingsStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    settings.forEach(setting => {
        settingsStmt.run(setting.key, setting.value);
    });
    settingsStmt.finalize();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ products: rows });
        }
    });
});

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

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
        } else {
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) {
                    res.status(500).json({ error: 'Server error' });
                } else if (match) {
                    res.json({
                        success: true,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        }
                    });
                } else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
            });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            res.status(500).json({ error: 'Server error' });
        } else {
            db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hash], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        res.status(400).json({ error: 'Email already exists' });
                    } else {
                        res.status(500).json({ error: err.message });
                    }
                } else {
                    res.json({ success: true, message: 'Registration successful' });
                }
            });
        }
    });
});

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields required' });
    }

    db.run('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
        [name, email, message], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, message: 'Message sent successfully' });
        }
    });
});

// Serve index.html for all routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(\`🚀 Ermi Mobile Server running on port \${PORT}\`);
    console.log(\`🌐 Environment: \${process.env.NODE_ENV || 'development'}\`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    db.close();
    process.exit(0);
});
`;

    fs.writeFileSync('server-render-simple.js', renderServer);
    console.log('✅ Created server-render-simple.js');

    // Create simple package.json
    const simplePackage = {
        "name": "ermi-mobile",
        "version": "1.0.0",
        "description": "Ermi Mobile Store",
        "main": "server.js",
        "scripts": {
            "start": "node server.js"
        },
        "engines": {
            "node": "18.x"
        },
        "dependencies": {
            "express": "^4.18.2",
            "sqlite3": "^5.1.6",
            "bcrypt": "^5.1.1",
            "cors": "^2.8.5"
        }
    };

    fs.writeFileSync('package-render-simple.json', JSON.stringify(simplePackage, null, 2));
    console.log('✅ Created package-render-simple.json');

    // Create render.yaml
    const renderYaml = `services:
  - type: web
    name: ermi-mobile
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
    healthCheckPath: /health
`;

    fs.writeFileSync('render-simple.yaml', renderYaml);
    console.log('✅ Created render-simple.yaml');
}

function createDeployScript() {
    console.log('\n📄 Creating deployment script...');
    
    const deployScript = `@echo off
echo 🔧 APPLYING RENDER FIXES
echo ========================

echo.
echo 📄 Backing up current files...
if exist server.js copy server.js server-backup.js
if exist package.json copy package.json package-backup.json

echo.
echo 🔄 Applying simple Render configuration...
copy server-render-simple.js server.js
copy package-render-simple.json package.json
copy render-simple.yaml render.yaml

echo.
echo 🔄 Installing dependencies...
npm install

echo.
echo 📄 Committing changes...
git add .
git commit -m "Fix Render deployment - simplified server"

echo.
echo 🎉 RENDER FIX APPLIED!
echo ===================
echo ✅ Simplified server created
echo ✅ Dependencies updated
echo ✅ render.yaml configured
echo ✅ Changes committed
echo.
echo 🚀 Now push to GitHub:
echo    git push origin main
echo.
echo 🌐 Your site will be live at:
echo    https://ermi-mobile.onrender.com
echo.
pause
`;

    fs.writeFileSync('apply-render-fix.bat', deployScript);
    console.log('✅ Created apply-render-fix.bat');
}

// Run diagnostics
checkCurrentFiles();
checkPackageJson();
checkServerJs();
checkRenderYaml();
createRenderFix();
createDeployScript();

console.log('\n🎯 DIAGNOSIS COMPLETE!');
console.log('=====================');
console.log('✅ Diagnostic files created');
console.log('✅ Simplified server created');
console.log('✅ Render configuration updated');
console.log('✅ Deployment script ready');
console.log('');
console.log('🚀 Run: apply-render-fix.bat');
console.log('Then push to GitHub and redeploy on Render!');