# Railway Environment Variable Setup

## Quick Fix for Persistent Database

Your Railway deployment is losing products because the database isn't stored in the persistent volume.

## Solution: Set Environment Variable

### In Railway Dashboard:

1. Go to your project: https://railway.app
2. Click on your service
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add:
   ```
   Name: DATABASE_PATH
   Value: /data/emobile.db
   ```
6. Click **Add**
7. Click **Deploy** (or it will auto-deploy)

### Verify Volume is Mounted

1. In Railway, go to **Settings** → **Volumes**
2. You should see a volume mounted at `/data`
3. If not, create one:
   - Click **+ New Volume**
   - Mount Path: `/data`
   - Click **Add**

## What This Does

- ✅ Database will be stored in `/data/emobile.db` (persistent volume)
- ✅ Products will auto-seed on first deploy
- ✅ Products will persist across all future deploys
- ✅ No more data loss on redeploy

## After Setting Up

When you deploy, check the logs. You should see:

**First Deploy:**
```
🌱 Auto-seeding Railway database...
📦 Database is empty - seeding products and categories...
✅ Seeded product: Wireless Earbuds 📸
... (all 9 products)
🎉 Auto-seeding complete!
```

**Subsequent Deploys:**
```
🌱 Auto-seeding Railway database...
ℹ️  Database already has 9 products - skipping seed
```

## Current Auto-Seed Features

✅ Automatically seeds 9 products with images
✅ Automatically seeds 4 categories
✅ Only runs if database is empty
✅ Skips if products already exist
✅ Includes product images

## That's It!

Once you set `DATABASE_PATH=/data/emobile.db`, your products will persist forever!
