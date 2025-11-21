const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./emobile.db');

console.log('🌱 Seeding database with sample data...\n');

// Create admin user
bcrypt.hash('admin123', 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    
    db.run(
        'INSERT OR IGNORE INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)',
        ['Admin', 'admin@ermimobile.com', hash, 'admin', 1],
        function(err) {
            if (err) {
                console.log('⚠️  Admin user might already exist');
            } else if (this.changes > 0) {
                console.log('✅ Admin user created');
                console.log('   Email: admin@ermimobile.com');
                console.log('   Password: admin123\n');
            }
        }
    );
});

// Add sample products
const products = [
    { 
        name: 'Wireless Earbuds Pro', 
        price: 2500, 
        icon: 'fa-headphones', 
        stock: 50, 
        description: 'Premium wireless earbuds with active noise cancellation and 24-hour battery life',
        category_id: null 
    },
    { 
        name: 'Protective Phone Case', 
        price: 500, 
        icon: 'fa-mobile-alt', 
        stock: 100, 
        description: 'Durable protective case with shock absorption for all phone models',
        category_id: null 
    },
    { 
        name: 'Fast Charger 20W', 
        price: 800, 
        icon: 'fa-charging-station', 
        stock: 75, 
        description: 'Quick charge adapter with USB-C port and smart charging technology',
        category_id: null 
    },
    { 
        name: 'Tempered Glass Screen Protector', 
        price: 300, 
        icon: 'fa-shield-alt', 
        stock: 150, 
        description: '9H hardness tempered glass with oleophobic coating',
        category_id: null 
    },
    { 
        name: 'Power Bank 10000mAh', 
        price: 1800, 
        icon: 'fa-battery-full', 
        stock: 40, 
        description: 'Portable power bank with dual USB ports and LED indicator',
        category_id: null 
    },
    { 
        name: 'USB-C Cable 2m', 
        price: 400, 
        icon: 'fa-plug', 
        stock: 200, 
        description: 'Durable braided USB-C charging cable with fast data transfer',
        category_id: null 
    },
    { 
        name: 'Car Phone Holder', 
        price: 600, 
        icon: 'fa-car', 
        stock: 80, 
        description: 'Universal car phone holder with 360° rotation and strong grip',
        category_id: null 
    },
    { 
        name: 'Bluetooth Speaker', 
        price: 3500, 
        icon: 'fa-volume-up', 
        stock: 30, 
        description: 'Portable Bluetooth speaker with deep bass and 12-hour playtime',
        category_id: null 
    },
    { 
        name: 'Selfie Stick with Tripod', 
        price: 900, 
        icon: 'fa-camera', 
        stock: 60, 
        description: 'Extendable selfie stick with built-in tripod and Bluetooth remote',
        category_id: null 
    },
    { 
        name: 'Phone Ring Holder', 
        price: 250, 
        icon: 'fa-ring', 
        stock: 120, 
        description: '360° rotating ring holder with magnetic car mount compatibility',
        category_id: null 
    },
    { 
        name: 'Wireless Charging Pad', 
        price: 1200, 
        icon: 'fa-wifi', 
        stock: 45, 
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices',
        category_id: null 
    },
    { 
        name: 'AUX Audio Cable', 
        price: 350, 
        icon: 'fa-headphones-alt', 
        stock: 90, 
        description: '3.5mm auxiliary audio cable with gold-plated connectors',
        category_id: null 
    }
];

console.log('Adding products...\n');

let completed = 0;
products.forEach((product, index) => {
    setTimeout(() => {
        db.run(
            'INSERT INTO products (name, price, icon, stock, description, category_id) VALUES (?, ?, ?, ?, ?, ?)',
            [product.name, product.price, product.icon, product.stock, product.description, product.category_id],
            function(err) {
                completed++;
                if (err) {
                    console.log(`❌ Error adding ${product.name}:`, err.message);
                } else {
                    console.log(`✅ Added: ${product.name} (${product.price} Birr)`);
                }
                
                // Close database after all products are added
                if (completed === products.length) {
                    setTimeout(() => {
                        db.close((err) => {
                            if (err) {
                                console.error('\n❌ Error closing database:', err.message);
                            } else {
                                console.log('\n🎉 Database seeded successfully!');
                                console.log(`📦 ${products.length} products added`);
                                console.log('👤 1 admin user created');
                                console.log('\n🚀 You can now start your server!');
                            }
                        });
                    }, 500);
                }
            }
        );
    }, index * 100);
});
