#!/usr/bin/env node
/**
 * Show Localhost Products
 * Displays all products in your local database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = './emobile.db';

console.log('📦 Localhost Products Database');
console.log('==============================\n');

// Open database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        console.log('\n💡 Make sure emobile.db exists in the current directory.');
        console.log('   Run "npm start" first to create the database.\n');
        process.exit(1);
    }
});

// Get products
db.all('SELECT * FROM products ORDER BY id', [], (err, products) => {
    if (err) {
        console.error('❌ Error reading products:', err.message);
        db.close();
        process.exit(1);
    }

    if (products.length === 0) {
        console.log('ℹ️  No products found in localhost database.\n');
        console.log('💡 To add products:');
        console.log('   1. Run: npm start');
        console.log('   2. Visit: http://localhost:3000/admin.html');
        console.log('   3. Add products via admin panel\n');
        db.close();
        return;
    }

    console.log(`✅ Found ${products.length} product(s) in localhost:\n`);
    console.log('═'.repeat(80));

    products.forEach((product, index) => {
        console.log(`\n📱 Product #${index + 1}`);
        console.log('─'.repeat(80));
        console.log(`   ID:          ${product.id}`);
        console.log(`   Name:        ${product.name}`);
        console.log(`   Price:       ${product.price} Birr`);
        console.log(`   Icon:        ${product.icon}`);
        console.log(`   Stock:       ${product.stock || 100}`);
        console.log(`   Category ID: ${product.category_id || 'None'}`);
        if (product.description) {
            console.log(`   Description: ${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}`);
        }
        if (product.image) {
            console.log(`   Image:       ${product.image}`);
        }
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`\n📊 Total: ${products.length} products`);
    console.log('\n💡 To sync these to Railway, run:');
    console.log('   node sync-local-to-railway.js\n');

    db.close();
});
