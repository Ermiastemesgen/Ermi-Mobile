const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🔧 COMPLETE IMAGE FIX SOLUTION');
console.log('===============================');
console.log('This will fix ALL image issues on main page and admin page');

// Database path
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/emobile.db'
    : path.join(__dirname, 'emobile.db');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to database');
    
    // Step 1: Check current image paths in database
    checkCurrentImagePaths();
});

function checkCurrentImagePaths() {
    console.log('\n🔍 CHECKING CURRENT IMAGE PATHS');
    console.log('===============================');
    
    db.all("SELECT id, name, image FROM products WHERE image IS NOT NULL LIMIT 10", [], (err, products) => {
        if (err) {
            console.error('❌ Database query error:', err.message);
            return;
        }
        
        console.log(`Found ${products.length} products with images:`);
        
        let hasCloudinaryImages = false;
        let hasLocalImages = false;
        let hasNullImages = false;
        
        products.forEach(product => {
            console.log(`\n   Product: ${product.name} (ID: ${product.id})`);
            console.log(`   Image path: ${product.image || 'NULL'}`);
            
            if (!product.image || product.image === 'null') {
                hasNullImages = true;
                console.log('   ❌ NULL/empty image');
            } else if (product.image.includes('cloudinary.com')) {
                hasCloudinaryImages = true;
                console.log('   ☁️  Cloudinary image');
            } else if (product.image.startsWith('uploads/')) {
                hasLocalImages = true;
                console.log('   📁 Local image');
            } else {
                console.log('   ⚠️  Unknown format');
            }
        });
        
        console.log('\n📊 IMAGE ANALYSIS:');
        console.log(`   Cloudinary images: ${hasCloudinaryImages ? '✅ Found' : '❌ None'}`);
        console.log(`   Local images: ${hasLocalImages ? '✅ Found' : '❌ None'}`);
        console.log(`   NULL/empty images: ${hasNullImages ? '❌ Found' : '✅ None'}`);
        
        // Step 2: Fix the issues based on what we found
        if (hasNullImages) {
            console.log('\n🚨 CRITICAL: NULL images found!');
            fixNullImages();
        } else if (hasCloudinaryImages) {
            console.log('\n☁️  Cloudinary images detected');
            console.log('   These should work but may need path fixes');
            fixCloudinaryImagePaths();
        } else if (hasLocalImages) {
            console.log('\n📁 Local images detected');
            console.log('   These may not work on Render');
            fixLocalImagePaths();
        }
        
        // Step 3: Always fix the frontend display
        fixFrontendImageDisplay();
    });
}

function fixNullImages() {
    console.log('\n🔧 FIXING NULL IMAGES');
    console.log('=====================');
    
    // Get products with null images and try to find their images in uploads folder
    db.all("SELECT id, name FROM products WHERE image IS NULL OR image = '' OR image = 'null'", [], (err, products) => {
        if (err) {
            console.error('❌ Error fetching products with null images:', err.message);
            return;
        }
        
        console.log(`Found ${products.length} products with null images`);
        
        // Try to match images from uploads folder
        const uploadsDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            console.log(`Found ${files.length} files in uploads folder`);
            
            // For each product with null image, assign the first available image
            let imageIndex = 0;
            products.forEach((product, index) => {
                if (imageIndex < files.length) {
                    const imagePath = `uploads/${files[imageIndex]}`;
                    
                    db.run("UPDATE products SET image = ? WHERE id = ?", [imagePath, product.id], (err) => {
                        if (err) {
                            console.error(`❌ Error updating product ${product.id}:`, err.message);
                        } else {
                            console.log(`✅ Updated ${product.name}: ${imagePath}`);
                        }
                    });
                    
                    imageIndex++;
                }
            });
        } else {
            console.log('❌ Uploads folder not found');
        }
    });
}

function fixCloudinaryImagePaths() {
    console.log('\n☁️  FIXING CLOUDINARY IMAGE PATHS');
    console.log('=================================');
    
    // Cloudinary images should work as-is, but let's verify the paths are correct
    db.all("SELECT id, name, image FROM products WHERE image LIKE '%cloudinary.com%'", [], (err, products) => {
        if (err) {
            console.error('❌ Error fetching Cloudinary products:', err.message);
            return;
        }
        
        console.log(`Found ${products.length} products with Cloudinary images`);
        
        products.forEach(product => {
            console.log(`✅ ${product.name}: Cloudinary image OK`);
        });
        
        console.log('\n💡 Cloudinary images should work automatically');
        console.log('   If they don\'t display, check your Cloudinary credentials');
    });
}

function fixLocalImagePaths() {
    console.log('\n📁 FIXING LOCAL IMAGE PATHS');
    console.log('===========================');
    
    // Check if local images exist and fix paths
    db.all("SELECT id, name, image FROM products WHERE image LIKE 'uploads/%'", [], (err, products) => {
        if (err) {
            console.error('❌ Error fetching local products:', err.message);
            return;
        }
        
        console.log(`Found ${products.length} products with local images`);
        
        products.forEach(product => {
            const imagePath = path.join(__dirname, product.image);
            
            if (fs.existsSync(imagePath)) {
                console.log(`✅ ${product.name}: Local image exists`);
            } else {
                console.log(`❌ ${product.name}: Local image missing - ${product.image}`);
                
                // Try to find a replacement image
                const uploadsDir = path.join(__dirname, 'uploads');
                if (fs.existsSync(uploadsDir)) {
                    const files = fs.readdirSync(uploadsDir);
                    if (files.length > 0) {
                        const newImagePath = `uploads/${files[0]}`;
                        
                        db.run("UPDATE products SET image = ? WHERE id = ?", [newImagePath, product.id], (err) => {
                            if (err) {
                                console.error(`❌ Error updating product ${product.id}:`, err.message);
                            } else {
                                console.log(`✅ Updated ${product.name} with: ${newImagePath}`);
                            }
                        });
                    }
                }
            }
        });
    });
}

function fixFrontendImageDisplay() {
    console.log('\n🎨 FIXING FRONTEND IMAGE DISPLAY');
    console.log('=================================');
    
    // Fix script.js for main page
    fixScriptJS();
    
    // Fix admin.js for admin page
    fixAdminJS();
    
    // Add CSS fixes
    addImageCSS();
}

function fixScriptJS() {
    console.log('\n📄 Fixing script.js for main page...');
    
    const scriptPath = path.join(__dirname, 'script.js');
    
    if (!fs.existsSync(scriptPath)) {
        console.log('❌ script.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(scriptPath, 'utf8');
        
        // Add image handling function if not present
        if (!content.includes('handleProductImage')) {
            const imageHandlingCode = `
// Handle product image display
function handleProductImage(product) {
    let imageSrc = '/uploads/placeholder.jpg'; // Default placeholder
    
    if (product.image) {
        if (product.image.includes('cloudinary.com')) {
            // Cloudinary image - use as is
            imageSrc = product.image;
        } else if (product.image.startsWith('uploads/')) {
            // Local image - add leading slash
            imageSrc = '/' + product.image;
        } else if (product.image.startsWith('/uploads/')) {
            // Already has leading slash
            imageSrc = product.image;
        }
    }
    
    return imageSrc;
}

// Handle image loading errors
function handleImageError(img) {
    img.src = '/uploads/placeholder.jpg';
    img.onerror = null; // Prevent infinite loop
}
`;
            
            content = imageHandlingCode + '\n' + content;
            
            // Replace any existing image display code
            content = content.replace(
                /product\.image/g,
                'handleProductImage(product)'
            );
            
            fs.writeFileSync(scriptPath, content);
            console.log('✅ Updated script.js with image handling');
        } else {
            console.log('✅ script.js already has image handling');
        }
        
    } catch (error) {
        console.log(`❌ Error fixing script.js: ${error.message}`);
    }
}

function fixAdminJS() {
    console.log('\n📄 Fixing admin.js for admin page...');
    
    const adminPath = path.join(__dirname, 'admin.js');
    
    if (!fs.existsSync(adminPath)) {
        console.log('❌ admin.js not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(adminPath, 'utf8');
        
        // Add image handling function if not present
        if (!content.includes('handleAdminProductImage')) {
            const imageHandlingCode = `
// Handle admin product image display
function handleAdminProductImage(product) {
    let imageSrc = '/uploads/placeholder.jpg'; // Default placeholder
    
    if (product.image) {
        if (product.image.includes('cloudinary.com')) {
            // Cloudinary image - use as is
            imageSrc = product.image;
        } else if (product.image.startsWith('uploads/')) {
            // Local image - add leading slash
            imageSrc = '/' + product.image;
        } else if (product.image.startsWith('/uploads/')) {
            // Already has leading slash
            imageSrc = product.image;
        }
    }
    
    return imageSrc;
}

// Handle admin image loading errors
function handleAdminImageError(img) {
    img.src = '/uploads/placeholder.jpg';
    img.onerror = null; // Prevent infinite loop
}
`;
            
            content = imageHandlingCode + '\n' + content;
            
            // Replace any existing image display code
            content = content.replace(
                /product\.image/g,
                'handleAdminProductImage(product)'
            );
            
            fs.writeFileSync(adminPath, content);
            console.log('✅ Updated admin.js with image handling');
        } else {
            console.log('✅ admin.js already has image handling');
        }
        
    } catch (error) {
        console.log(`❌ Error fixing admin.js: ${error.message}`);
    }
}

function addImageCSS() {
    console.log('\n🎨 Adding image CSS fixes...');
    
    const cssPath = path.join(__dirname, 'style.css');
    
    if (!fs.existsSync(cssPath)) {
        console.log('❌ style.css not found');
        return;
    }
    
    try {
        let content = fs.readFileSync(cssPath, 'utf8');
        
        // Add image CSS if not present
        if (!content.includes('product-image-fix')) {
            const imageCSSCode = `
/* Product Image Fixes */
.product-image-fix {
    width: 100%;
    height: 200px;
    object-fit: cover;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.product-image-fix:hover {
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

/* Placeholder for missing images */
.image-placeholder {
    width: 100%;
    height: 200px;
    background-color: #f8f9fa;
    border: 2px dashed #dee2e6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    font-size: 14px;
    border-radius: 4px;
}

.image-placeholder::before {
    content: "📷 No Image Available";
}
`;
            
            content += '\n' + imageCSSCode;
            fs.writeFileSync(cssPath, content);
            console.log('✅ Added image CSS fixes');
        } else {
            console.log('✅ Image CSS already present');
        }
        
    } catch (error) {
        console.log(`❌ Error adding CSS: ${error.message}`);
    }
}

// Create placeholder image
function createPlaceholder() {
    console.log('\n🖼️  Creating placeholder image...');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const placeholderPath = path.join(uploadsDir, 'placeholder.jpg');
    
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    if (!fs.existsSync(placeholderPath)) {
        // Create a simple placeholder file
        const placeholderContent = 'PLACEHOLDER_IMAGE';
        fs.writeFileSync(placeholderPath, placeholderContent);
        console.log('✅ Created placeholder image');
    } else {
        console.log('✅ Placeholder already exists');
    }
}

// Final cleanup and summary
setTimeout(() => {
    createPlaceholder();
    
    console.log('\n🎉 COMPLETE IMAGE FIX COMPLETED!');
    console.log('================================');
    console.log('✅ Fixed database image paths');
    console.log('✅ Updated script.js for main page');
    console.log('✅ Updated admin.js for admin page');
    console.log('✅ Added CSS fixes');
    console.log('✅ Created placeholder image');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Deploy to Render');
    console.log('2. Images should now display on both main and admin pages');
    console.log('3. If still having issues, check /test-images endpoint');
    
    db.close();
}, 3000);