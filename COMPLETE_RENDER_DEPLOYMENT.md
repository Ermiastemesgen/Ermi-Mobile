# Complete Render.com Deployment Guide

## 📋 Prerequisites

- Git installed on your computer
- GitHub account
- Render.com account (free)

---

## Part 1: Prepare Your Code

### Step 1: Verify Your Files

Make sure you have these files in your project:
- ✅ `server.js`
- ✅ `package.json`
- ✅ `index.html`
- ✅ `script.js`
- ✅ `style.css`
- ✅ `admin-simple.html`
- ✅ All other project files

### Step 2: Check package.json

Open `package.json` and verify it has:

```json
{
  "name": "ermi-mobile",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.18.2",
    "multer": "^2.0.2",
    "nodemailer": "^6.10.1",
    "sqlite3": "^5.1.6"
  }
}
```

### Step 3: Create .gitignore

Create a file named `.gitignore` with:

```
node_modules/
.env
*.log
.DS_Store
```

---

## Part 2: Push to GitHub

### Step 1: Initialize Git (if not done)

Open terminal in your project folder:

```bash
git init
```

### Step 2: Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@gmail.com"
```

### Step 3: Add All Files

```bash
git add .
```

### Step 4: Commit

```bash
git commit -m "Initial commit - Ermi Mobile e-commerce"
```

### Step 5: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ermi-mobile`
3. Description: "Mobile accessories e-commerce website"
4. **Public** or **Private** (your choice)
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

### Step 6: Connect to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git
git branch -M main
git push -u origin main
```

**If it asks for authentication:**
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your password)
  - Get token at: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select "repo" scope
  - Copy the token and use it as password

---

## Part 3: Deploy to Render

### Step 1: Sign Up for Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (easiest option)
4. Authorize Render to access your GitHub

### Step 2: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**

### Step 3: Connect Repository

1. Click **"Connect account"** if needed
2. Find and select: `YOUR_USERNAME/ermi-mobile`
3. Click **"Connect"**

### Step 4: Configure Service

Fill in these settings:

**Basic Settings:**
- **Name:** `ermi-mobile` (or any name you want)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** Leave empty
- **Runtime:** `Node`

**Build Settings:**
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

**Instance Type:**
- **Plan:** `Free`

### Step 5: Add Environment Variables (Optional)

Click **"Advanced"** and add these if you want email verification:

```
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
WEBSITE_URL=https://ermi-mobile.onrender.com
```

(Skip this if you don't need email verification)

### Step 6: Create Web Service

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Watch the logs for any errors

---

## Part 4: Verify Deployment

### Step 1: Check Deployment Status

In Render dashboard:
- Should show "Live" with green dot
- If "Deploy failed", check logs for errors

### Step 2: Test Your Website

Your website will be at:
```
https://ermi-mobile.onrender.com
```

(Replace `ermi-mobile` with your actual service name)

### Step 3: Test API

Visit:
```
https://ermi-mobile.onrender.com/api/products
```

Should show: `{"products":[]}`

---

## Part 5: Add Products

### Method 1: Use Admin Panel

1. Go to: `https://ermi-mobile.onrender.com/admin-simple.html`
2. Login:
   - Email: `admin@ermimobile.com`
   - Password: `admin123`
3. Add products manually using "Add Product" button

### Method 2: Use Add Products Page

1. Push the `add-products.html` file to GitHub:
   ```bash
   git add add-products.html
   git commit -m "Add products page"
   git push
   ```
2. Wait for Render to redeploy (2-3 minutes)
3. Visit: `https://ermi-mobile.onrender.com/add-products.html`
4. Click "Add Products Now"

### Method 3: Auto-Seed on Startup

The server is configured to automatically add products on first startup if database is empty.

---

## Part 6: Troubleshooting

### Issue: "Deploy Failed"

**Check Render Logs:**
1. Render Dashboard → Your Service → Logs
2. Look for error messages
3. Common issues:
   - Missing dependencies → Check package.json
   - Port issues → Server should use `process.env.PORT`
   - Database errors → Check server.js initialization

**Solution:**
- Fix the error in your code
- Commit and push to GitHub
- Render will auto-redeploy

### Issue: "Application Failed to Respond"

**Cause:** Server not listening on correct port

**Solution:**
Make sure server.js has:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Issue: Products Not Loading

**Check:**
1. Does `/api/products` return JSON?
2. Any errors in browser console (F12)?
3. Is database seeded?

**Solution:**
- Use admin panel to add products
- Or visit `/add-products.html`

### Issue: Admin Panel Stuck Loading

**Cause:** CSP blocking API calls or database empty

**Solution:**
1. Hard refresh: Ctrl+Shift+R
2. Check browser console for errors
3. Verify API works: `/api/products`

### Issue: "Cannot GET /api/products"

**Cause:** Server crashed or not running

**Solution:**
1. Check Render logs for errors
2. Restart service: Manual Deploy → Deploy latest commit
3. Check if server.js has the endpoint

---

## Part 7: Post-Deployment

### Update Your Website

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Render will automatically detect and deploy!

### Monitor Your Site

1. **Uptime:** Use UptimeRobot.com (free)
2. **Logs:** Check Render logs regularly
3. **Backups:** Download database periodically

### Upgrade (Optional)

Free tier limitations:
- Sleeps after 15 minutes of inactivity
- First load takes 30-60 seconds

Upgrade to paid ($7/month) for:
- Always-on service
- Faster performance
- More resources

---

## Part 8: Your Website URLs

**Main Website:**
```
https://ermi-mobile.onrender.com
```

**Admin Panel:**
```
https://ermi-mobile.onrender.com/admin-simple.html
```

**Add Products:**
```
https://ermi-mobile.onrender.com/add-products.html
```

**API:**
```
https://ermi-mobile.onrender.com/api/products
```

---

## Part 9: Admin Credentials

**Default Admin:**
- Email: `admin@ermimobile.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change password after first login!

---

## Part 10: Common Commands

### Git Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# View remote
git remote -v

# View commit history
git log --oneline
```

### Render Commands

- **Manual Deploy:** Render Dashboard → Manual Deploy
- **View Logs:** Render Dashboard → Logs
- **Restart:** Redeploy latest commit
- **Environment Variables:** Settings → Environment

---

## Part 11: Success Checklist

After deployment, verify:

- [ ] Website loads: `https://ermi-mobile.onrender.com`
- [ ] API works: `https://ermi-mobile.onrender.com/api/products`
- [ ] Products display on main page
- [ ] Admin panel loads
- [ ] Can login to admin
- [ ] Can add products
- [ ] Shopping cart works
- [ ] Checkout works
- [ ] No errors in browser console (F12)
- [ ] No errors in Render logs

---

## Part 12: Getting Help

### Check Logs First

Always check Render logs for errors:
```
Render Dashboard → Your Service → Logs
```

### Common Error Messages

**"Module not found"**
- Missing dependency in package.json
- Run `npm install` locally to verify

**"Port already in use"**
- Server not using `process.env.PORT`
- Check server.js port configuration

**"Database locked"**
- SQLite issue on Render
- Restart service

**"Failed to fetch"**
- CSP blocking API calls
- Check browser console
- Verify API endpoint exists

---

## 🎉 Congratulations!

Your Ermi Mobile e-commerce website is now live!

**Next Steps:**
1. Add your products
2. Customize settings
3. Share your website
4. Start selling!

**Your website is ready for business!** 🚀
