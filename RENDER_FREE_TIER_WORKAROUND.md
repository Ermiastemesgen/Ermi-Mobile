# Render Free Tier Workaround (No Persistent Disk)

## Problem
Render's free tier no longer includes persistent disk storage. Your database resets on every deploy.

## Solutions (Ranked by Ease)

### ⭐ Solution 1: Switch to Railway (Recommended - Easiest)

**Why Railway?**
- Free tier includes persistent storage
- 500 hours/month free (enough for small projects)
- Automatic deployments from GitHub
- No code changes needed

**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway auto-detects Node.js and deploys
7. Done! Your database persists automatically

**Migration:**
- Export your products from Render admin panel first
- Deploy to Railway
- Import products on Railway
- Update your domain (if you have one)

---

### Solution 2: Use Render + External Free Database

Keep using Render but store data externally.

#### Option A: Supabase PostgreSQL (Free Forever)

**Pros:**
- Free tier never expires
- 500MB database
- Automatic backups

**Steps:**
1. Go to https://supabase.com
2. Create account and new project
3. Get PostgreSQL connection string
4. Install pg: `npm install pg`
5. Update code to use PostgreSQL (requires code changes)

#### Option B: MongoDB Atlas (Free)

**Pros:**
- 512MB free storage
- Easy to use
- Good documentation

**Steps:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Install mongoose: `npm install mongoose`
5. Update code to use MongoDB (requires code changes)

---

### Solution 3: Stay on Render with Backup/Restore

**Accept database resets but automate recovery:**

#### Quick Backup System

1. **Before Each Deploy:**
   - Go to admin panel
   - Export products (already have this feature)
   - Save `products-export.json`

2. **After Deploy:**
   - Go to `/api/admin/import-products`
   - Products restore automatically from export file

#### Automated Backup (Advanced)

Add this to your code to auto-backup to GitHub Gist or external storage.

---

## Comparison Table

| Solution | Cost | Effort | Persistence | Best For |
|----------|------|--------|-------------|----------|
| Railway | Free | Low | ✅ Yes | Quick migration |
| Supabase | Free | Medium | ✅ Yes | Long-term |
| MongoDB | Free | Medium | ✅ Yes | NoSQL fans |
| Render + Backup | Free | Low | ⚠️ Manual | Current setup |

---

## My Recommendation

**For You: Switch to Railway**

**Why?**
1. ✅ No code changes needed
2. ✅ Free persistent storage
3. ✅ Easy migration (5 minutes)
4. ✅ Automatic GitHub deployments
5. ✅ Better free tier than Render

**Migration Steps:**
1. Export products from Render admin
2. Deploy to Railway (connect GitHub)
3. Import products on Railway
4. Done!

---

## If You Stay on Render

### Workaround: Keep Export File in Repo

1. Export products regularly
2. Commit `products-export.json` to GitHub
3. After deploy, visit: `https://your-site.onrender.com/api/admin/import-products`
4. Products restore automatically

### Add to Your Workflow:
```bash
# Before deploying
1. Export products from admin
2. Save products-export.json
3. Commit to GitHub
4. Push and deploy
5. After deploy, visit /api/admin/import-products
```

---

## Need Help?

**Railway Migration:**
- Railway docs: https://docs.railway.app
- Takes 5-10 minutes
- No code changes

**Database Migration:**
- I can help convert SQLite → PostgreSQL
- Or SQLite → MongoDB
- Requires code updates

**Questions?**
Let me know which solution you prefer and I'll help you implement it!
