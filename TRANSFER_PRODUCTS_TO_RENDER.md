# Transfer Products from Local to Render 📦

## Quick Steps

### Step 1: Export Products Locally ✅

Run this on your local machine:

```bash
node export-products.js
```

This creates a file called `products-export.json` with all your products and images.

### Step 2: Commit and Push to Git 🚀

```bash
git add products-export.json export-products.js import-products.js
git commit -m "Add product export/import scripts and data"
git push origin main
```

### Step 3: Import on Render 📥

After Render deploys (2-3 minutes), the `products-export.json` file will be on Render.

Then use **ONE** of these methods:

#### Method A: Via Render Shell (If Available)
1. Go to Render Dashboard → Your Service → Shell
2. Run: `node import-products.js`

#### Method B: Via API Endpoint (Automatic)
I'll create an API endpoint you can visit to trigger the import.

---

## Detailed Instructions

### Local Export

1. **Open terminal** in your project folder

2. **Run export script:**
   ```bash
   node export-products.js
   ```

3. **You'll see:**
   ```
   ✅ Products exported successfully!
   📦 Total products: 5
   🖼️  Total images: 10
   📄 File: products-export.json
   
   Products exported:
     1. Product Name 1 - 1000 Birr (2 images)
     2. Product Name 2 - 2000 Birr (3 images)
     ...
   ```

4. **Check the file:**
   - A file called `products-export.json` is created
   - Contains all your products and images

### Deploy to Render

1. **Commit the export file:**
   ```bash
   git add products-export.json export-products.js import-products.js
   git commit -m "Add products export data"
   git push origin main
   ```

2. **Wait for Render to deploy** (2-3 minutes)

3. **The file is now on Render!**

### Import on Render

#### Option 1: Automatic Import Endpoint

Visit this URL in your browser:
```
https://ermi-mobile.onrender.com/api/admin/import-products
```

This will automatically import all products!

#### Option 2: Manual via Shell

If Render Shell works for you:
```bash
node import-products.js
```

---

## What Gets Transferred

### Products:
- ✅ Product name
- ✅ Price
- ✅ Icon
- ✅ Stock
- ✅ Description
- ✅ Category
- ✅ Main image URL

### Images:
- ✅ All product images
- ✅ Display order
- ✅ Image URLs

### Notes:
- ⚠️ **Image files themselves** are NOT transferred (only URLs)
- ⚠️ If images are stored locally (`/uploads/`), they won't work on Render
- ✅ If images are on Cloudinary, they WILL work!

---

## Important: Image Storage

### If Your Images Are Local (`/uploads/...`):
- ❌ They won't work on Render (ephemeral storage)
- 💡 **Solution:** Re-upload images via Render admin panel
- 💡 **Better:** Images will upload to Cloudinary automatically

### If Your Images Are on Cloudinary:
- ✅ They will work perfectly!
- ✅ No re-upload needed
- ✅ Everything transfers smoothly

---

## Troubleshooting

### "File not found: products-export.json"
- Run `node export-products.js` first
- Make sure the file was created
- Commit and push it to Git

### "Products already exist"
- The import script skips duplicate products (by name)
- This is safe - it won't create duplicates

### Images don't show on Render
- Local images (`/uploads/`) don't transfer
- Re-upload images via Render admin panel
- They'll automatically go to Cloudinary

### No products exported
- Make sure you have products in local database
- Check with: `node -e "const sqlite3=require('sqlite3').verbose();const db=new sqlite3.Database('./emobile.db');db.all('SELECT COUNT(*) as count FROM products',(e,r)=>{console.log(r);db.close();});"`

---

## Alternative: Manual Method

If scripts don't work, you can manually add products:

1. Go to Render admin panel
2. Click "Products" → "Add Product"
3. Fill in details
4. Upload images
5. Save

This is slower but guaranteed to work!

---

## Quick Reference

### Export locally:
```bash
node export-products.js
```

### Commit and push:
```bash
git add products-export.json
git commit -m "Add products export"
git push origin main
```

### Import on Render (after deploy):
Visit: `https://ermi-mobile.onrender.com/api/admin/import-products`

Or run: `node import-products.js`

---

## Summary

1. ✅ Export products locally
2. ✅ Commit and push to Git
3. ✅ Wait for Render to deploy
4. ✅ Import via API endpoint or Shell
5. ✅ Re-upload images if needed (they'll go to Cloudinary)

---

**Your products will be transferred to Render!** 📦→☁️

---
**Date:** 2025-11-22
**Status:** Scripts ready, follow steps above
