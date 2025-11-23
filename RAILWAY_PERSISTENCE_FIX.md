# Railway Database Persistence Fix

## 🚨 **The Problem**

You're experiencing two issues:
1. **Sample products appear** when you deploy to Railway
2. **Your products disappear** when you redeploy

## 🔍 **Root Cause**

Railway is using **ephemeral storage** instead of **persistent storage**:
- Database file gets recreated on each deployment
- Your manually added products are lost
- System may be auto-seeding to avoid empty database

## 🔧 **Complete Fix**

### **Step 1: Enable Railway Persistent Storage**

1. **Go to Railway Dashboard**
2. **Select your project**
3. **Go to Settings tab**
4. **Scroll to "Volumes" section**
5. **Click "Add Volume"**
6. **Configure:**
   - **Mount Path:** `/data`
   - **Size:** 1GB (minimum)
7. **Click "Add Volume"**

### **Step 2: Update Environment Variables**

1. **Go to Variables tab in Railway**
2. **Add new variable:**
   - **Key:** `DATABASE_PATH`
   - **Value:** `/data/emobile.db`
3. **Save changes**

### **Step 3: Update Server Configuration**

The server is already configured to use `process.env.DATABASE_PATH`, so this should work automatically.

### **Step 4: Redeploy**

1. **Trigger a new deployment** (push any small change)
2. **Check deployment logs** for:
   ```
   ✅ Connected to SQLite database
   📍 Database path: /data/emobile.db
   ```

## 🧪 **Test the Fix**

### **After Redeployment:**

1. **Check admin panel** - should be empty initially
2. **Add a test product** via admin panel
3. **Trigger another deployment** (push a small change)
4. **Check admin panel again** - your product should still be there!

## 🚫 **Disable Any Remaining Auto-Seeding**

Run this on Railway console to ensure no auto-seeding:

```bash
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DATABASE_PATH || './emobile.db');
db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['auto_products_disabled', 'true']);
db.close();
console.log('✅ Auto-seeding disabled');
"
```

## 📋 **Verification Steps**

### **1. Check Database Location**
```bash
echo $DATABASE_PATH
# Should show: /data/emobile.db
```

### **2. Check Database Persistence**
```bash
ls -la /data/
# Should show: emobile.db
```

### **3. Check Products**
```bash
node check-railway-products.js
```

## ✅ **Expected Results**

After implementing this fix:

- ✅ **Database persists** between deployments
- ✅ **No sample products** added automatically
- ✅ **Your products stay saved** when you redeploy
- ✅ **Settings persist** (About Us text, etc.)
- ✅ **User accounts persist**

## 🔄 **Migration Process**

If you already have products you want to keep:

### **Before Enabling Persistence:**
1. **Export current products:**
   ```bash
   node export-products.js
   ```

### **After Enabling Persistence:**
1. **Import your products:**
   ```bash
   node import-products.js
   ```

## 🚨 **Important Notes**

- **Persistent storage costs extra** on Railway (but minimal for 1GB)
- **Without persistent storage**, database will always reset
- **With persistent storage**, your data survives deployments
- **First deployment** after enabling persistence will start with empty database

## 🆘 **If Still Having Issues**

1. **Check Railway logs** for database path
2. **Verify volume is mounted** at `/data`
3. **Confirm environment variable** `DATABASE_PATH=/data/emobile.db`
4. **Test with a simple product** add/redeploy cycle

---

**This fix will completely solve both problems: no more sample products and your products will persist!**