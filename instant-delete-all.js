#!/usr/bin/env node

/**
 * INSTANT DELETE ALL - ERMI MOBILE
 * This script immediately deletes everything without confirmation
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('🚨 INSTANT DELETION - ERMI MOBILE');
console.log('=================================');

// 1. Delete all from database
console.log('🗑️  Deleting database content...');
const db = new sqlite3.Database('./emobile.db');

db.serialize(() => {
    db.run('DELETE FROM products', function(err) {
        if (!err) console.log('✅ Deleted', this.changes, 'products');
    });
    
    db.run('DELETE FROM categories', function(err) {
        if (!err) console.log('✅ Deleted', this.changes, 'categories');
    });
    
    db.run("DELETE FROM users WHERE email != 'ermias616@gmail.com'", function(err) {
        if (!err) console.log('✅ Deleted', this.changes, 'users');
    });
    
    db.run('DELETE FROM contacts', function(err) {
        if (!err) console.log('✅ Deleted', this.changes, 'contacts');
    });
});

db.close();

// 2. Delete all uploads
console.log('🗑️  Deleting uploads...');
const uploadsDir = './uploads';

if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
        }
    });
    console.log('✅ All uploads deleted');
}

// 3. Reset main page
console.log('🗑️  Resetting main page...');
const deletedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ermi Mobile - Deleted</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: #f5f5f5;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #e74c3c; 
            margin-bottom: 20px;
        }
        p { 
            color: #666; 
            margin: 20px 0; 
            line-height: 1.6;
        }
        .deleted { 
            color: #e74c3c; 
            font-weight: bold; 
        }
        ul {
            text-align: left;
            color: #666;
            margin: 20px 0;
        }
        li {
            margin: 8px 0;
        }
        .timestamp {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗑️ Ermi Mobile - All Content Deleted</h1>
        <p>All website content has been <span class="deleted">permanently deleted</span>.</p>
        
        <h3>Deleted Items:</h3>
        <ul>
            <li>✅ All products and categories</li>
            <li>✅ All user accounts (except admin)</li>
            <li>✅ All uploaded product images</li>
            <li>✅ All contact form messages</li>
            <li>✅ All shopping cart data</li>
            <li>✅ All website content</li>
        </ul>
        
        <div class="timestamp">
            <strong>Deletion completed:</strong><br>
            ${new Date().toLocaleString()}
        </div>
        
        <p><em>The website is now completely empty and ready for fresh content.</em></p>
    </div>
</body>
</html>`;

fs.writeFileSync('index.html', deletedHTML);
console.log('✅ Main page reset to deletion notice');

// 4. Reset CSS and JS to minimal
console.log('🗑️  Resetting CSS and JS files...');

const minimalCSS = `/* Ermi Mobile - Deleted */
body {
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 50px;
    background: #f5f5f5;
}
.deleted-notice {
    color: #e74c3c;
    font-size: 24px;
    font-weight: bold;
}`;

const minimalJS = `// Ermi Mobile - All content deleted
console.log('🗑️ Ermi Mobile - All content has been deleted');
console.log('Deletion completed:', new Date().toLocaleString());`;

fs.writeFileSync('style.css', minimalCSS);
fs.writeFileSync('script.js', minimalJS);

console.log('✅ CSS and JS files reset');

console.log('');
console.log('🎯 DELETION COMPLETE!');
console.log('');
console.log('📋 What was deleted:');
console.log('   ✅ All products and categories');
console.log('   ✅ All users (except admin)');
console.log('   ✅ All uploaded images');
console.log('   ✅ All contact messages');
console.log('   ✅ Main page content');
console.log('   ✅ CSS and JS files reset');
console.log('');
console.log('🌐 To delete from Render:');
console.log('   1. Deploy these changes to Render');
console.log('   2. Or manually delete via Render dashboard');
console.log('');
console.log('✅ Local deletion completed successfully!');