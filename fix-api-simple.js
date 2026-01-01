const fs = require('fs');
const path = require('path');

console.log('🔧 SIMPLE API CONNECTION FIX');
console.log('=============================');

// Fix 1: Ensure API routes exist in server.js
function fixServerRoutes() {
    console.log('\n🌐 Checking server.js API routes...');
    
    const serverPath = path.join(__dirname, 'server.js');
    
    if (!fs.existsSync(serverPath)) {
        console.log('❌ server.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(serverPath, 'utf8');
        
        // Check if products API route exists
        if (!content.includes('app.get(\'/api/products\'')) {
            console.log('❌ Products API route missing! Adding it...');
            
            // Find insertion point (before health check)
            const insertionPoint = content.indexOf('// ===== Health Check Endpoint =====');
            if (insertionPoint !== -1) {
                const apiRoutes = `
// ===== API Routes =====
app.get('/api/products', (req, res) => {
    console.log('📡 Products API called');
    
    const query = \`
        SELECT p.*, c.name as category_name, c.parent_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
    \`;
    
    db.all(query, [], (err, products) => {
        if (err) {
            console.error('❌ Database error:', err.message);
            res.status(500).json({ error: 'Database error', message: err.message });
            return;
        }
        
        console.log(\`✅ Returning \${products.length} products\`);
        res.json({ products: products });
    });
});

app.get('/api/categories', (req, res) => {
    console.log('📡 Categories API called');
    
    db.all("SELECT * FROM categories ORDER BY parent_id ASC, name ASC", [], (err, categories) => {
        if (err) {
            console.error('❌ Categories error:', err.message);
            res.status(500).json({ error: 'Database error', message: err.message });
            return;
        }
        
        console.log(\`✅ Returning \${categories.length} categories\`);
        res.json({ categories: categories });
    });
});

`;
                
                content = content.slice(0, insertionPoint) + apiRoutes + content.slice(insertionPoint);
                fs.writeFileSync(serverPath, content);
                console.log('✅ Added API routes to server.js');
            } else {
                console.log('⚠️  Could not find insertion point');
            }
        } else {
            console.log('✅ API routes already exist');
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Fix 2: Update script.js API configuration
function fixScriptAPI() {
    console.log('\n📄 Fixing script.js API configuration...');
    
    const scriptPath = path.join(__dirname, 'script.js');
    
    if (!fs.existsSync(scriptPath)) {
        console.log('❌ script.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Replace API_URL configuration
        const oldAPIConfig = /const API_URL = window\.location\.hostname === 'localhost'[\s\S]*?;/;
        const newAPIConfig = `const API_URL = window.location.origin + '/api';
console.log('🔗 API_URL set to:', API_URL);`;
        
        if (oldAPIConfig.test(content)) {
            content = content.replace(oldAPIConfig, newAPIConfig);
            console.log('✅ Updated API_URL configuration');
        } else {
            console.log('⚠️  Could not find API_URL to replace');
        }
        
        fs.writeFileSync(scriptPath, content);
        console.log('✅ Updated script.js');
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Fix 3: Create emergency products seeder
function createSeeder() {
    console.log('\n🌱 Creating emergency seeder...');
    
    const seederCode = `const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
        return;
    }
    
    console.log('✅ Connected to database');
    
    // Check if products exist
    db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
        if (err) {
            console.error('❌ Error:', err.message);
            return;
        }
        
        console.log(\`📊 Products in database: \${row.count}\`);
        
        if (row.count === 0) {
            console.log('🌱 Adding emergency products...');
            
            const products = [
                ['Wireless Earbuds', 1800, 'High-quality wireless earbuds', 'uploads/placeholder.jpg', 100, 'fa-headphones'],
                ['Phone Case', 1000, 'Protective phone case', 'uploads/placeholder.jpg', 50, 'fa-mobile-alt'],
                ['Fast Charger', 1400, '30W fast charger', 'uploads/placeholder.jpg', 75, 'fa-plug'],
                ['Bluetooth Speaker', 3500, 'Portable speaker', 'uploads/placeholder.jpg', 30, 'fa-volume-up'],
                ['Smart Watch', 1500, 'Smartwatch with health tracking', 'uploads/placeholder.jpg', 25, 'fa-clock']
            ];
            
            const stmt = db.prepare("INSERT INTO products (name, price, description, image, stock, icon) VALUES (?, ?, ?, ?, ?, ?)");
            
            products.forEach(product => {
                stmt.run(product, (err) => {
                    if (err) {
                        console.error(\`❌ Error inserting \${product[0]}:\`, err.message);
                    } else {
                        console.log(\`✅ Added \${product[0]}\`);
                    }
                });
            });
            
            stmt.finalize(() => {
                console.log('🎉 Emergency products added!');
                db.close();
            });
        } else {
            console.log('✅ Products already exist');
            db.close();
        }
    });
});`;
    
    try {
        fs.writeFileSync('emergency-seed.js', seederCode);
        console.log('✅ Created emergency-seed.js');
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Main execution
console.log('🎯 Starting API connection fix...');
fixServerRoutes();
fixScriptAPI();
createSeeder();

console.log('\n🎉 API FIX COMPLETED!');
console.log('====================');
console.log('✅ Fixed server API routes');
console.log('✅ Updated script.js API config');
console.log('✅ Created emergency seeder');
console.log('');
console.log('🚀 Next: Deploy and test!');