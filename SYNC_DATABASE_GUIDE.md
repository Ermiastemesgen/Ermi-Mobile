# Sync Localhost Database to Railway

## 🎯 Quick Guide

This guide shows you how to import all products from your localhost database into Railway.

---

## 📋 Prerequisites

1. **Localhost has products** - Add products locally first
2. **Railway is running** - Deployment must be active
3. **Admin credentials** - You need admin access

---

## 🚀 Method 1: Automatic Sync (Recommended)

### Step 1: Make Sure Localhost Has Products

```bash
# Start localhost server
npm start

# Visit: http://localhost:3000/admin.html
# Add your products there
```

### Step 2: Run Sync Script

```bash
# This will copy all products from localhost to Railway
node sync-local-to-railway.js
```

**What it does:**
1. ✅ Reads products from localhost database
2. ✅ Logs into Railway admin
3. ✅ Uploads each product to Railway
4. ✅ Shows progress and results

**Expected output:**
```
🔄 Syncing Localhost Database to Railway
==========================================

📦 Step 1: Reading localhost database...
✅ Found 9 products in localhost

   1. Wireless Earbuds - 1500 Birr
   2. Phone Case - 500 Birr
   ...

🔐 Step 2: Logging into Railway...
✅ Logged into Railway successfully

📤 Step 3: Uploading products to Railway...

   Uploading 1/9: Wireless Earbuds... ✅
   Uploading 2/9: Phone Case... ✅
   ...

📊 Upload Summary:
   ✅ Successful: 9
   ❌ Failed: 0
   📦 Total: 9

✅ Sync complete!
🌐 Check Railway admin panel: https://ermimobile.up.railway.app/admin.html
```

---

## 🔄 Method 2: Export/Import (Manual)

### Step 1: Export from Localhost

```bash
# Make sure localhost server is running
npm start

# In another terminal, export products
node export-products.js
```

This creates `products-export.json`

### Step 2: Import to Railway

**Option A: Using Railway CLI**
```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Import products
railway run node import-products.js
```

**Option B: Manual Upload**
1. Open `products-export.json`
2. Copy the product data
3. Go to Railway admin panel
4. Add each product manually

---

## 📊 Verify Sync

After syncing, verify products are on Railway:

### Check via Admin Panel
1. Go to: https://ermimobile.up.railway.app/admin.html
2. Login with admin credentials
3. Click "Products" tab
4. Should see all your products

### Check via API
```bash
curl https://ermimobile.up.railway.app/api/products
```

Should return JSON with all products.

### Check via Main Site
Visit: https://ermimobile.up.railway.app

Products should display on homepage.

---

## 🔧 Troubleshooting

### "No products found in localhost"
**Solution:** Add products to localhost first
```bash
npm start
# Visit http://localhost:3000/admin.html
# Add products
```

### "Login failed"
**Solution:** Check admin credentials in script
- Email: `ermias616@gmail.com`
- Password: `Ermi@0211`

### "Railway not accessible"
**Solution:** Check Railway deployment status
- Go to: https://railway.app/dashboard
- Ensure deployment is "Active"

### "Upload failed"
**Solution:** Check Railway logs
- Some products might have invalid data
- Check Railway deployment logs for errors

---

## 💡 Tips

### Tip 1: Test with Few Products First
Add 2-3 products locally, sync, verify they appear on Railway.

### Tip 2: Clear Railway Products First (Optional)
If you want to start fresh:
```bash
railway run node railway-direct-db-fix.js clear-products
```

### Tip 3: Backup Before Sync
```bash
# Backup Railway database first
railway run node export-products.js > railway-backup.json
```

### Tip 4: Sync Regularly
Run sync script whenever you add new products locally:
```bash
node sync-local-to-railway.js
```

---

## 🎯 Complete Workflow

**Typical workflow for managing products:**

1. **Develop Locally**
   ```bash
   npm start
   # Add/test products at http://localhost:3000/admin.html
   ```

2. **Sync to Railway**
   ```bash
   node sync-local-to-railway.js
   ```

3. **Verify on Railway**
   ```
   Visit: https://ermimobile.up.railway.app
   ```

4. **Done!** Products are live

---

## 📝 What Gets Synced

The sync script copies:
- ✅ Product name
- ✅ Price
- ✅ Icon
- ✅ Description
- ✅ Stock quantity
- ✅ Category

**Note:** Images need to be re-uploaded on Railway if using local files.

---

## ⚠️ Important Notes

1. **Duplicates:** Script will create new products, not update existing ones
2. **Images:** Local image paths won't work on Railway - use Cloudinary URLs
3. **IDs:** Product IDs will be different on Railway
4. **One-way:** This syncs localhost → Railway (not bidirectional)

---

## 🚀 Quick Start

**Just want to sync now? Run this:**

```bash
# 1. Make sure localhost has products
npm start
# Add products at http://localhost:3000/admin.html

# 2. Stop localhost server (Ctrl+C)

# 3. Run sync
node sync-local-to-railway.js

# 4. Check Railway
# Visit: https://ermimobile.up.railway.app/admin.html
```

---

## ✅ Success!

Once synced:
- ✅ All localhost products are on Railway
- ✅ Products are live on your website
- ✅ Customers can see and buy them
- ✅ Admin panel shows all products

**Your e-commerce site is ready!** 🎉
