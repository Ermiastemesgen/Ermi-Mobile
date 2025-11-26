# Railway CLI - Direct Database Access

## 🎯 Bypass API Issues with Direct Database Access

If the API isn't working, you can directly access the Railway database using Railway CLI.

---

## 📦 Step 1: Install Railway CLI

### Windows (PowerShell):
```powershell
iwr https://railway.app/install.ps1 | iex
```

### Mac/Linux:
```bash
curl -fsSL https://railway.app/install.sh | sh
```

### Alternative (npm):
```bash
npm install -g @railway/cli
```

---

## 🔐 Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

---

## 🔗 Step 3: Link to Your Project

Navigate to your project directory:
```bash
cd "C:\Users\HP\Downloads\Telegram Desktop\Kiro project"
```

Link to Railway project:
```bash
railway link
```

Select your project from the list (Ermi Mobile).

---

## 🗑️ Step 4: Delete Power Banks Directly

### Method 1: Using Our Script

```bash
railway run node railway-direct-db-fix.js delete-powerbanks
```

This will:
- Connect to Railway database
- Find all Power Bank products
- Delete them
- Show confirmation

### Method 2: Direct SQL Command

```bash
railway run node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.run('DELETE FROM products WHERE name LIKE \"%Power Bank%\"', function(err) { if (err) console.error(err); else console.log('Deleted', this.changes, 'products'); db.close(); });"
```

---

## 📋 Other Useful Commands

### List All Products
```bash
railway run node railway-direct-db-fix.js list-products
```

### Clear All Products
```bash
railway run node railway-direct-db-fix.js clear-products
```

### Reset Database
```bash
railway run node railway-direct-db-fix.js reset-db
```

---

## 🔍 Check Database Status

### View Database File
```bash
railway run ls -la *.db
```

### Check Products Count
```bash
railway run node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.get('SELECT COUNT(*) as count FROM products', (err, row) => { console.log('Total products:', row.count); db.close(); });"
```

---

## 🚀 Quick Reference

### Delete Power Banks (Fastest Way)
```bash
# 1. Navigate to project
cd "C:\Users\HP\Downloads\Telegram Desktop\Kiro project"

# 2. Run delete command
railway run node railway-direct-db-fix.js delete-powerbanks
```

### List Products
```bash
railway run node railway-direct-db-fix.js list-products
```

---

## 💡 Local Testing (Without Railway CLI)

If you want to test locally first:

```bash
# Use local database
node railway-direct-db-fix.js delete-powerbanks

# List local products
node railway-direct-db-fix.js list-products
```

---

## 🔧 Troubleshooting

### "railway: command not found"
**Solution:** Railway CLI not installed
```bash
npm install -g @railway/cli
```

### "Not linked to a project"
**Solution:** Link to your project
```bash
railway link
```

### "Database file not found"
**Solution:** Ensure you're running on Railway
```bash
railway run node railway-direct-db-fix.js delete-powerbanks
```

### "Permission denied"
**Solution:** Login to Railway
```bash
railway login
```

---

## ✅ Verification

After deleting Power Banks:

### Check via CLI
```bash
railway run node railway-direct-db-fix.js list-products
```

### Check via Website
Once Railway redeploys:
- Visit: https://ermimobile.up.railway.app
- Power Banks should be gone

---

## 🎯 Complete Workflow

**To delete Power Banks using Railway CLI:**

1. **Install Railway CLI** (one-time)
   ```bash
   npm install -g @railway/cli
   ```

2. **Login** (one-time)
   ```bash
   railway login
   ```

3. **Link Project** (one-time)
   ```bash
   cd "C:\Users\HP\Downloads\Telegram Desktop\Kiro project"
   railway link
   ```

4. **Delete Power Banks** (anytime)
   ```bash
   railway run node railway-direct-db-fix.js delete-powerbanks
   ```

5. **Verify**
   ```bash
   railway run node railway-direct-db-fix.js list-products
   ```

---

## 📊 Script Commands Reference

| Command | Description |
|---------|-------------|
| `delete-powerbanks` | Delete all Power Bank products |
| `list-products` | Show all products |
| `clear-products` | Delete ALL products |
| `reset-db` | Clear entire database |
| `help` | Show help message |

---

## 🚨 Important Notes

1. **Railway CLI runs commands on Railway servers**, not locally
2. **Changes are immediate** and affect production database
3. **No undo** - deleted products cannot be recovered
4. **Backup first** if you're unsure

---

## 💾 Backup Database First (Optional)

```bash
# Download database backup
railway run cat emobile.db > backup-$(date +%Y%m%d).db

# Or export products to JSON
railway run node export-products.js
```

---

## ✅ Success!

Once you run the delete command:
- Power Banks are removed from database
- Changes are immediate
- No API needed
- No deployment required

The website will reflect changes immediately on next page load!
