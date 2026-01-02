#!/usr/bin/env node

/**
 * ERMI MOBILE - COMPLETE DELETION SCRIPT
 * This script will delete ALL content from both Render and Local deployments
 * 
 * WARNING: This is IRREVERSIBLE! All data will be permanently lost.
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 ERMI MOBILE - COMPLETE DELETION SCRIPT');
console.log('==========================================');
console.log('⚠️  WARNING: This will DELETE EVERYTHING!');
console.log('⚠️  This action is IRREVERSIBLE!');
console.log('');

// Function to delete all products from database
async function deleteAllProducts() {
    console.log('🗑️  Deleting all products from database...');
    
    const deleteScript = `
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Delete from local database
const localDb = new sqlite3.Database('./emobile.db');
localDb.run('DELETE FROM products', function(err) {
    if (err) {
        console.error('Error deleting local products:', err);
    } else {
        console.log('✅ Deleted', this.changes, 'products from local database');
    }
});

// Delete categories
localDb.run('DELETE FROM categories', function(err) {
    if (err) {
        console.error('Error deleting local categories:', err);
    } else {
        console.log('✅ Deleted', this.changes, 'categories from local database');
    }
});

// Delete users (except admin)
localDb.run("DELETE FROM users WHERE email != 'ermias616@gmail.com'", function(err) {
    if (err) {
        console.error('Error deleting local users:', err);
    } else {
        console.log('✅ Deleted', this.changes, 'users from local database');
    }
});

// Delete contacts
localDb.run('DELETE FROM contacts', function(err) {
    if (err) {
        console.error('Error deleting local contacts:', err);
    } else {
        console.log('✅ Deleted', this.changes, 'contacts from local database');
    }
});

localDb.close();
`;

    fs.writeFileSync('temp-delete-db.js', deleteScript);
    
    try {
        require('./temp-delete-db.js');
        fs.unlinkSync('temp-delete-db.js');
    } catch (error) {
        console.error('❌ Error deleting database content:', error.message);
    }
}

// Function to clear all uploads
function deleteAllUploads() {
    console.log('🗑️  Deleting all uploaded files...');
    
    const uploadsDir = './uploads';
    
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            try {
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                    console.log('✅ Deleted:', file);
                }
            } catch (error) {
                console.error('❌ Error deleting file:', file, error.message);
            }
        });
        
        console.log('✅ All uploads deleted');
    } else {
        console.log('ℹ️  No uploads directory found');
    }
}

// Function to reset main page content
function resetMainPageContent() {
    console.log('🗑️  Resetting main page content...');
    
    // Create minimal index.html
    const minimalHTML = `<!DOCTYPE html>
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
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #e74c3c; }
        p { color: #666; margin: 20px 0; }
        .deleted { color: #e74c3c; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗑️ Ermi Mobile - Content Deleted</h1>
        <p>All content has been <span class="deleted">permanently deleted</span>.</p>
        <p>This includes:</p>
        <ul style="text-align: left; color: #666;">
            <li>All products</li>
            <li>All categories</li>
            <li>All user data (except admin)</li>
            <li>All uploaded images</li>
            <li>All contact messages</li>
        </ul>
        <p><strong>Deletion completed on:</strong> ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;

    fs.writeFileSync('index.html', minimalHTML);
    console.log('✅ Main page reset to deletion notice');
}

// Function to create Render deletion API call
function createRenderDeletionScript() {
    console.log('🗑️  Creating Render deletion script...');
    
    const renderDeleteScript = `#!/usr/bin/env node

/**
 * RENDER DELETION SCRIPT
 * This script will delete all content from Render deployment
 */

const https = require('https');

// Render API endpoints (replace with your actual Render URL)
const RENDER_URL = 'https://ermi-mobile.onrender.com';

async function deleteRenderContent() {
    console.log('🌐 Deleting content from Render deployment...');
    
    // Delete all products via API
    const deleteEndpoints = [
        '/api/products/delete-all',
        '/api/categories/delete-all', 
        '/api/contacts/delete-all',
        '/api/users/delete-all-except-admin'
    ];
    
    for (const endpoint of deleteEndpoints) {
        try {
            console.log('🗑️  Calling:', RENDER_URL + endpoint);
            
            const options = {
                hostname: 'ermi-mobile.onrender.com',
                path: endpoint,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    console.log('✅ Response:', data);
                });
            });
            
            req.on('error', (error) => {
                console.error('❌ Error:', error.message);
            });
            
            req.end();
            
            // Wait between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error('❌ Error deleting from Render:', error.message);
        }
    }
}

deleteRenderContent();
`;

    fs.writeFileSync('delete-render-content.js', renderDeleteScript);
    console.log('✅ Render deletion script created: delete-render-content.js');
}

// Function to backup before deletion (optional)
function createBackup() {
    console.log('💾 Creating backup before deletion...');
    
    const backupDir = `./backup-${Date.now()}`;
    
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }
    
    // Backup database
    if (fs.existsSync('./emobile.db')) {
        fs.copyFileSync('./emobile.db', path.join(backupDir, 'emobile.db'));
        console.log('✅ Database backed up');
    }
    
    // Backup uploads
    if (fs.existsSync('./uploads')) {
        const backupUploads = path.join(backupDir, 'uploads');
        fs.mkdirSync(backupUploads);
        
        const files = fs.readdirSync('./uploads');
        files.forEach(file => {
            fs.copyFileSync(
                path.join('./uploads', file),
                path.join(backupUploads, file)
            );
        });
        console.log('✅ Uploads backed up');
    }
    
    console.log('✅ Backup created in:', backupDir);
}

// Main execution
async function main() {
    console.log('Starting deletion process...');
    console.log('');
    
    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('⚠️  Are you ABSOLUTELY SURE you want to delete EVERYTHING? (type "DELETE EVERYTHING" to confirm): ', async (answer) => {
        if (answer === 'DELETE EVERYTHING') {
            console.log('');
            console.log('🚨 DELETION CONFIRMED - Starting process...');
            console.log('');
            
            // Create backup first
            createBackup();
            console.log('');
            
            // Delete everything
            await deleteAllProducts();
            console.log('');
            
            deleteAllUploads();
            console.log('');
            
            resetMainPageContent();
            console.log('');
            
            createRenderDeletionScript();
            console.log('');
            
            console.log('🎯 LOCAL DELETION COMPLETE!');
            console.log('');
            console.log('📋 Next steps:');
            console.log('1. Run: node delete-render-content.js (to delete Render content)');
            console.log('2. Deploy the reset index.html to Render');
            console.log('3. Verify both local and Render are cleared');
            console.log('');
            console.log('✅ All local content has been deleted!');
            
        } else {
            console.log('❌ Deletion cancelled - nothing was deleted');
        }
        
        rl.close();
    });
}

// Run the script
main().catch(console.error);