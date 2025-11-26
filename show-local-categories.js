#!/usr/bin/env node
/**
 * Show Localhost Categories
 * Displays all categories in your local database
 */

const sqlite3 = require('sqlite3').verbose();

const DB_PATH = './emobile.db';

console.log('📂 Localhost Categories Database');
console.log('=================================\n');

// Open database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        console.log('\n💡 Make sure emobile.db exists in the current directory.\n');
        process.exit(1);
    }
});

// Get categories
db.all('SELECT * FROM categories ORDER BY id', [], (err, categories) => {
    if (err) {
        console.error('❌ Error reading categories:', err.message);
        db.close();
        process.exit(1);
    }

    if (categories.length === 0) {
        console.log('ℹ️  No categories found in localhost database.\n');
        console.log('💡 To add categories:');
        console.log('   1. Run: npm start');
        console.log('   2. Visit: http://localhost:3000/admin.html');
        console.log('   3. Go to Categories tab and add categories\n');
        db.close();
        return;
    }

    console.log(`✅ Found ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} in localhost:\n`);
    console.log('═'.repeat(80));

    categories.forEach((category, index) => {
        console.log(`\n📁 Category #${index + 1}`);
        console.log('─'.repeat(80));
        console.log(`   ID:          ${category.id}`);
        console.log(`   Name:        ${category.name}`);
        if (category.description) {
            console.log(`   Description: ${category.description}`);
        }
        if (category.parent_id) {
            console.log(`   Parent ID:   ${category.parent_id}`);
        } else {
            console.log(`   Parent ID:   None (Top-level category)`);
        }
        if (category.image) {
            console.log(`   Image:       ${category.image}`);
        }
        console.log(`   Created:     ${category.created_at || 'N/A'}`);
    });

    console.log('\n' + '═'.repeat(80));

    // Get product count per category
    db.all(`
        SELECT category_id, COUNT(*) as count 
        FROM products 
        WHERE category_id IS NOT NULL 
        GROUP BY category_id
    `, [], (err, counts) => {
        if (!err && counts.length > 0) {
            console.log('\n📊 Products per Category:');
            console.log('─'.repeat(80));
            
            counts.forEach(count => {
                const cat = categories.find(c => c.id === count.category_id);
                if (cat) {
                    console.log(`   ${cat.name}: ${count.count} product(s)`);
                }
            });
        }

        console.log(`\n📊 Total: ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`);
        console.log('\n💡 To sync categories to Railway:');
        console.log('   Categories are automatically synced when you sync products\n');

        db.close();
    });
});
