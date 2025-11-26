# Automatic Deployment Guide

## ✅ Auto-Deploy is Already Active!

Railway automatically deploys every time you push to GitHub. No additional setup needed!

---

## 🚀 How to Deploy Changes

### Method 1: Manual Commands (What you've been doing)

```bash
git add .
git commit -m "Your change description"
git push origin main
```

Railway detects the push and deploys automatically.

---

### Method 2: Quick Deploy Script (NEW!)

**For Windows (PowerShell/CMD):**

```bash
deploy.bat "Your commit message"
```

**For Mac/Linux:**

```bash
chmod +x deploy.sh
./deploy.sh "Your commit message"
```

**Example:**
```bash
deploy.bat "Fixed product images"
```

This will:
1. Stage all changes (`git add -A`)
2. Commit with your message
3. Push to GitHub
4. Railway auto-deploys

---

## 📊 Monitor Deployments

### Railway Dashboard
https://railway.app/dashboard

**Check:**
- Latest deployment status
- Build logs
- Deploy time
- Any errors

### Your Live Site
https://ermimobile.up.railway.app

**Verify:**
- Changes are live
- No errors
- Everything works

---

## ⏰ Deployment Timeline

After pushing to GitHub:

1. **0-10 seconds:** Railway detects push
2. **10s-3min:** Building (Docker build + npm install)
3. **3-4min:** Deploying (starting container)
4. **4-5min:** Health check passes
5. **✅ Live!** Changes are deployed

**Total time: 4-5 minutes**

---

## 🎯 What Triggers Auto-Deploy

Railway automatically deploys when:

✅ **You push commits**
```bash
git push origin main
```

✅ **You merge pull requests** on GitHub

✅ **You edit files** directly on GitHub

✅ **You use the deploy script**
```bash
deploy.bat "message"
```

❌ **Does NOT deploy when:**
- You only commit locally (without pushing)
- You push to other branches (not main)
- You change environment variables (manual redeploy needed)

---

## 🔧 Verify Auto-Deploy Settings

1. Go to **Railway Dashboard**
2. Click your **project**
3. Click **"Settings"** tab
4. Check **"Source"** section:
   - **Repository:** Should show your GitHub repo
   - **Branch:** Should be `main`
   - **Watch Paths:** Empty or `*` (watches all files)

---

## 💡 Pro Tips

### Tip 1: Check Before Pushing
```bash
# See what will be committed
git status

# See actual changes
git diff
```

### Tip 2: Test Locally First
```bash
# Run locally before deploying
npm start

# Visit http://localhost:3000
# Test your changes
```

### Tip 3: Watch Railway Logs
- Go to Railway Dashboard
- Click "Deployments"
- Click latest deployment
- Watch real-time logs

### Tip 4: Rollback if Needed
- Go to "Deployments" tab
- Find previous working deployment
- Click ⋮ → "Redeploy"

---

## 🚨 Troubleshooting

### "Deployment stuck"
**Solution:** Cancel and redeploy
1. Go to Deployments
2. Click ⋮ on stuck deployment
3. Click "Cancel"
4. Click "Redeploy" on latest

### "Changes not showing"
**Solution:** Clear browser cache
- Hard refresh: `Ctrl + Shift + R` (Windows)
- Or: `Cmd + Shift + R` (Mac)

### "Build failed"
**Solution:** Check logs
1. Go to Deployments
2. Click failed deployment
3. Read error logs
4. Fix issue
5. Push again

---

## 📝 Example Workflow

**Scenario:** You want to change the hero title

1. **Edit file:**
   ```bash
   # Edit index.html or translations.js
   ```

2. **Deploy:**
   ```bash
   deploy.bat "Updated hero title"
   ```

3. **Wait 4-5 minutes**

4. **Check site:**
   ```
   https://ermimobile.up.railway.app
   ```

5. **Done!** ✅

---

## 🎉 Summary

**You don't need to do anything special!**

Just:
1. Make your changes
2. Push to GitHub (`git push origin main`)
3. Railway automatically deploys
4. Wait 4-5 minutes
5. Changes are live!

**Or use the quick script:**
```bash
deploy.bat "Your message"
```

That's it! Railway handles everything automatically.

---

## 📞 Quick Reference

**Deploy Command:**
```bash
deploy.bat "message"
```

**Manual Deploy:**
```bash
git add .
git commit -m "message"
git push origin main
```

**Check Status:**
- Dashboard: https://railway.app/dashboard
- Live Site: https://ermimobile.up.railway.app

**Typical Deploy Time:** 4-5 minutes

**Auto-Deploy:** ✅ Already enabled!
