# Fix Railway.app Server Error

Common reasons for Railway deployment errors and how to fix them.

## 🔍 Common Issues

### 1. Missing Environment Variables
Railway doesn't have your `.env` file (and shouldn't - it contains secrets!)

### 2. Port Configuration
Railway assigns a dynamic PORT that your app must use.

### 3. Database Path Issues
SQLite file path might not work on Railway.

### 4. Missing Start Command
Railway needs to know how to start your app.

## ✅ Quick Fixes

### Fix 1: Update server.js for Railway

Your server.js already uses `process.env.PORT`, which is good!

But make sure this line exists at the top:
```javascript
const PORT = process.env.PORT || 3000;
```

### Fix 2: Add Environment Variables in Railway

1. Go to your Railway project
2. Click on your service
3. Go to **Variables** tab
4. Add these variables:

```
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
WEBSITE_URL=https://your-app.up.railway.app
```

**Important:** Don't add PORT - Railway sets this automatically!

### Fix 3: Create railway.json

Create a file called `railway.json` in your project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Fix 4: Update package.json

Make sure your `package.json` has the start script:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### Fix 5: Check Build Logs

In Railway:
1. Click on your deployment
2. Go to **Deployments** tab
3. Click on the latest deployment
4. Check **Build Logs** and **Deploy Logs**
5. Look for error messages

## 🚨 Specific Error Solutions

### Error: "Cannot find module"
**Solution:** Make sure all dependencies are in package.json
```bash
npm install
```

### Error: "EADDRINUSE"
**Solution:** Don't hardcode port 3000, use process.env.PORT
```javascript
const PORT = process.env.PORT || 3000;
```

### Error: "Database locked" or "SQLITE_CANTOPEN"
**Solution:** SQLite doesn't work well on Railway. Use PostgreSQL instead.

### Error: "Application failed to respond"
**Solution:** Check that your server is listening on the correct port:
```javascript
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
```

## 🗄️ Database Issue (Important!)

**SQLite doesn't work on Railway!** Railway's filesystem is ephemeral (resets on each deploy).

### Solution: Use PostgreSQL

Railway provides free PostgreSQL. Here's how to switch:

#### Step 1: Add PostgreSQL to Railway
1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a database and provide connection URL

#### Step 2: Install PostgreSQL driver
```bash
npm install pg
```

#### Step 3: Update your code (or use SQLite locally, PostgreSQL in production)

For now, let's make SQLite work temporarily:

## 🔧 Temporary SQLite Fix

Update your server.js database initialization:

```javascript
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create database directory if needed
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize Database
const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'emobile.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});
```

## 📝 Complete Deployment Checklist

### Before Deploying:

- [ ] `package.json` has all dependencies
- [ ] `package.json` has start script: `"start": "node server.js"`
- [ ] Server uses `process.env.PORT`
- [ ] Server listens on `0.0.0.0` not just `localhost`
- [ ] `.env` file is in `.gitignore` (don't commit it!)
- [ ] No hardcoded localhost URLs in code

### In Railway Dashboard:

- [ ] Add environment variables (EMAIL_USER, EMAIL_PASS, etc.)
- [ ] Check build logs for errors
- [ ] Check deploy logs for errors
- [ ] Verify the app is running

## 🎯 Recommended: Use Render Instead

Railway can be tricky with SQLite. **Render.com** is easier:

### Why Render is Better for Your App:
- ✅ Free tier available
- ✅ Persistent disk for SQLite
- ✅ Easier configuration
- ✅ Better documentation
- ✅ Automatic SSL

### Deploy to Render:
1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Name:** ermi-mobile
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
6. Add environment variables
7. Click **"Create Web Service"**

## 🔍 Debug Railway Errors

### Check Logs:
```
Railway Dashboard → Your Service → Deployments → Latest → Logs
```

### Common Log Errors:

**"Error: listen EADDRINUSE"**
- Using hardcoded port
- Fix: Use `process.env.PORT`

**"Cannot find module 'dotenv'"**
- Missing dependency
- Fix: `npm install dotenv`

**"SQLITE_CANTOPEN"**
- Database file can't be created
- Fix: Use PostgreSQL or switch to Render

**"Application failed to respond"**
- Server not starting
- Fix: Check server.js for errors

## 💡 Quick Test Locally

Before deploying, test with Railway's PORT:

```bash
# Windows PowerShell
$env:PORT=8080; node server.js

# Check if it works on http://localhost:8080
```

## 🆘 Still Having Issues?

### Option 1: Share Error Logs
Copy the error from Railway logs and I can help debug.

### Option 2: Use Render Instead
Render is more beginner-friendly and works better with SQLite.

### Option 3: Use Vercel + Supabase
- Deploy frontend to Vercel
- Use Supabase for database (free PostgreSQL)

## 📊 Comparison

| Platform | SQLite Support | Free Tier | Ease of Use |
|----------|---------------|-----------|-------------|
| Railway  | ❌ No         | $5 credit | Medium      |
| Render   | ✅ Yes        | ✅ Yes    | Easy        |
| Heroku   | ❌ No         | ❌ No     | Medium      |
| Vercel   | ❌ No         | ✅ Yes    | Easy        |

**Recommendation:** Use **Render.com** for your app!

---

**Need specific help?** Share the error message from Railway logs!
