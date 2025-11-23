# Railway Deployment Troubleshooting Guide

## 🚨 **Current Issue: Admin Panel & APIs Not Loading**

Your Railway deployment appears to have server connectivity issues. Here's how to diagnose and fix:

## 🔍 **Step 1: Check Server Status**

### **Use Basic Test Tools:**
1. **Server Status:** `https://your-railway-app.railway.app/server-status.html`
2. **Basic Test:** `https://your-railway-app.railway.app/basic-test.html`

### **What to Look For:**
- ✅ **Server Online:** Green status, fast response
- ❌ **Server Offline:** Red status, timeout errors
- ⚠️ **Server Error:** Yellow status, HTTP errors

## 🔧 **Step 2: Check Railway Dashboard**

### **Service Status:**
1. **Go to Railway Dashboard**
2. **Select your project**
3. **Check service status:**
   - 🟢 **Running:** Service is active
   - 🔴 **Crashed:** Service has stopped
   - 🟡 **Building:** Service is deploying

### **Deployment Logs:**
1. **Click on your service**
2. **Go to "Deployments" tab**
3. **Click on latest deployment**
4. **Check logs for errors:**
   ```
   ✅ Good: "✅ Connected to SQLite database"
   ❌ Bad: "Error:", "ECONNREFUSED", "Port already in use"
   ```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Service Crashed**
**Symptoms:** Server status shows offline, Railway shows crashed
**Solutions:**
1. **Check deployment logs** for error messages
2. **Redeploy service** in Railway dashboard
3. **Check environment variables** are set correctly
4. **Verify DATABASE_PATH** is set to `/data/emobile.db`

### **Issue 2: Database Issues**
**Symptoms:** Server online but APIs timeout
**Solutions:**
1. **Check persistent storage** is enabled
2. **Verify volume mounted** at `/data`
3. **Run database fix script** in Railway console
4. **Check DATABASE_PATH** environment variable

### **Issue 3: Port Issues**
**Symptoms:** Service won't start, port errors in logs
**Solutions:**
1. **Check server.js** uses `process.env.PORT`
2. **Verify Railway auto-assigns port**
3. **Don't hardcode port 3000** in production

### **Issue 4: Memory/Resource Limits**
**Symptoms:** Service starts then crashes, out of memory errors
**Solutions:**
1. **Upgrade Railway plan** if needed
2. **Optimize database queries**
3. **Check for memory leaks**

## 🔄 **Step 3: Fix Deployment**

### **Quick Fixes:**
1. **Restart Service:**
   - Go to Railway dashboard
   - Click "Restart" on your service

2. **Redeploy:**
   - Push any small change to GitHub
   - Or click "Deploy Latest" in Railway

3. **Check Environment Variables:**
   ```
   DATABASE_PATH=/data/emobile.db
   NODE_ENV=production
   ```

4. **Enable Persistent Storage:**
   - Go to Settings → Volumes
   - Add volume: Mount path `/data`, Size 1GB

### **Advanced Fixes:**

1. **Database Reset:**
   ```bash
   # In Railway console
   rm -f /data/emobile.db
   node railway-complete-fix.js
   ```

2. **Manual Service Restart:**
   ```bash
   # In Railway console
   pm2 restart all
   # or
   killall node && npm start
   ```

## 📋 **Step 4: Verify Fix**

### **Test Checklist:**
- [ ] **Server Status:** Green/Online
- [ ] **Main Website:** Loads correctly
- [ ] **API Endpoints:** `/api/products` returns data
- [ ] **Admin Panel:** Loads without hanging
- [ ] **Database:** Products/settings persist

### **Test URLs:**
```
https://your-railway-app.railway.app/
https://your-railway-app.railway.app/api/products
https://your-railway-app.railway.app/admin-emergency.html
https://your-railway-app.railway.app/server-status.html
```

## 🆘 **If Nothing Works**

### **Nuclear Option - Fresh Deployment:**
1. **Create new Railway service**
2. **Connect to same GitHub repo**
3. **Set environment variables:**
   - `DATABASE_PATH=/data/emobile.db`
4. **Enable persistent storage**
5. **Deploy and test**

### **Alternative - Use Railway CLI:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

## 📞 **Get Help**

### **Share This Information:**
1. **Railway service URL**
2. **Server status test results**
3. **Deployment logs (last 50 lines)**
4. **Environment variables list**
5. **Any error messages**

### **Railway Support:**
- Railway Discord community
- Railway documentation
- GitHub issues

---

**Most issues are solved by enabling persistent storage and setting the correct DATABASE_PATH environment variable.**