#!/usr/bin/env node
/**
 * Direct Database Operations for Railway
 * Bypasses API to directly manipulate the database
 * 
 * Usage: node railway-direct-db-fix.js [command]
 * 
 * Commands:
 *   delete-powerbanks  - Delete all Power Bank products
 *   list-products      - List all products
 *   clear-products     - Delete ALL products
 *   reset-db           - Reset database to clean state
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path (adjust if needed)
const DB_PATH = process.env.DATABASE_PATH || './emobile.db';

console.log('🔧 Railway Direct Database Tool');
console.log('================================\n');
console.log(`📁 Database: ${DB_PATH}\n`);

// Get command from arguments
const command = process.argv[2] || 'help';

// Open database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        console.log('\n💡 Make sure you are running this on Railway or have the database file locally.');
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
    
    // Execute command
    executeCommand(command);
});

function executeCommand(cmd) {
    switch(cmd) {
        case 'delete-powerbanks':
            deletePowerBanks();
            break;
        case 'list-products':
            listProducts();
            break;
        case 'clear-products':
            clearAllProducts();
            break;
        case 'reset-db':
            resetDatabase();
            break;
        case 'help':
        default:
            showHelp();
            db.close();
            break;
    }
}

// Delete Power Bank products
function deletePowerBanks() {
    console.log('🗑️  Deleting Power Bank products...\n');
    
    // First, show what will be deleted
    db.all(
        `SELECT id, name, price FROM products WHERE name LIKE '%Power Bank%' OR name LIKE '%power bank%' OR name LIKE '%POWER BANK%'`,
        [],
        (err, rows) => {
            if (err) {
                console.error('❌ Error finding products:', err.message);
                db.close();
                return;
            }
            
            if (rows.length === 0) {
                console.log('ℹ️  No Power Bank products found.');
                db.close();
                return;
            }
            
            console.log(`Found ${rows.length} Power Bank product(s):\n`);
            rows.forEach(row => {
                console.log(`  📦 ${row.name} (ID: ${row.id}) - ${row.price} Birr`);
            });
            console.log('');
            
            // Delete them
            db.run(
                `DELETE FROM products WHERE name LIKE '%Power Bank%' OR name LIKE '%power bank%' OR name LIKE '%POWER BANK%'`,
                [],
                function(err) {
                    if (err) {
                        console.error('❌ Error deleting products:', err.message);
                    } else {
                        console.log(`✅ Successfully deleted ${this.changes} Power Bank product(s)!`);
                    }
                    db.close();
                }
            );
        }
    );
}

// List all products
function listProducts() {
    console.log('📋 Listing all products...\n');
    
    db.all('SELECT id, name, price, stock FROM products ORDER BY id', [], (err, rows) => {
        if (err) {
            console.error('❌ Error listing products:', err.message);
            db.close();
            return;
        }
        
        if (rows.length === 0) {
            console.log('ℹ️  No products found in database.');
        } else {
            console.log(`Total products: ${rows.length}\n`);
            rows.forEach(row => {
                console.log(`  ${row.id}. ${row.name}`);
                console.log(`     Price: ${row.price} Birr | Stock: ${row.stock}`);
                console.log('');
            });
        }
        
        db.close();
    });
}

// Clear all products
function clearAllProducts() {
    console.log('⚠️  WARNING: This will delete ALL products!\n');
    
    db.run('DELETE FROM products', [], function(err) {
        if (err) {
            console.error('❌ Error clearing products:', err.message);
        } else {
            console.log(`✅ Deleted ${this.changes} product(s)`);
            console.log('✅ All products cleared from database!');
        }
        db.close();
    });
}

// Reset database
function resetDatabase() {
    console.log('🔄 Resetting database...\n');
    
    const tables = ['products', 'product_images', 'orders', 'order_items'];
    let completed = 0;
    
    tables.forEach(table => {
        db.run(`DELETE FROM ${table}`, [], function(err) {
            if (err) {
                console.error(`❌ Error clearing ${table}:`, err.message);
            } else {
                console.log(`✅ Cleared ${table} (${this.changes} rows)`);
            }
            
            completed++;
            if (completed === tables.length) {
                console.log('\n✅ Database reset complete!');
                db.close();
            }
        });
    });
}

// Show help
function showHelp() {
    console.log('Available Commands:');
    console.log('==================\n');
    console.log('  delete-powerbanks  - Delete all Power Bank products');
    console.log('  list-products      - List all products in database');
    console.log('  clear-products     - Delete ALL products (use with caution!)');
    console.log('  reset-db           - Reset database (clear all data)');
    console.log('  help               - Show this help message\n');
    console.log('Usage:');
    console.log('  node railway-direct-db-fix.js [command]\n');
    console.log('Examples:');
    console.log('  node railway-direct-db-fix.js delete-powerbanks');
    console.log('  node railway-direct-db-fix.js list-products\n');
}

// Handle errors
process.on('uncaughtException', (err) => {
    console.error('\n❌ Unexpected error:', err.message);
    db.close();
    process.exit(1);
});
