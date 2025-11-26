# Railway Simple Fix - Keep Products After Deploy

## The Problem
Products disappear after Railway redeploys.

## Simple Solution

Instead of using `/data/emobile.db`, just use the default `./emobile.db` with a Railway volume.

### Steps:

1. **Remove DATABASE_PATH variable** (if you added it)
   - Go to Railway → Variables
   - Delete `DATABASE_PATH` variable
   - Save

2. **Add a Volume**
   - Go to Railway → Settings → Volumes
   - Click "+ New Volume"
   - Mount Path: `/app` (this is where your code runs)
   - Size: 1GB
   - Click "Add"

3. **Redeploy**
   - Railway will automatically redeploy
   - Products will auto-seed on first deploy
   - Products will persist on all future deploys

## Why This Works

- Railway runs your app in `/app` directory
- Database file `emobile.db` is created in `/app`
- Volume mounted at `/app` makes everything persistent
- No need to change DATABASE_PATH

## After Deploy

Check logs - you should see:
```
🌱 Auto-seeding Railway database...
📦 Database is empty - seeding products and categories...
✅ Seeded product: Wireless Earbuds 📸
... (all 9 products)
🎉 Auto-seeding complete!
```

Next deploy will show:
```
🌱 Auto-seeding Railway database...
ℹ️  Database already has 9 products - skipping seed
```

## That's It!

Your products will now persist forever with no configuration changes needed!
