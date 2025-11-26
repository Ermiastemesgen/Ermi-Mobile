# Railway Persistent Database Fix

## Problem
Products and categories are deleted when Railway redeploys because the database is not stored in the persistent volume.

## Solution
Railway needs to store the database in a mounted volume path.

## Steps to Fix

### 1. Check Railway Volume Configuration

In your Railway project:
1. Go to your service settings
2. Click on "Variables" tab
3. Add/Update this environment variable:

```
DATABASE_PATH=/data/emobile.db
```

### 2. Verify Volume Mount

In Railway:
1. Go to "Settings" → "Volumes"
2. Make sure you have a volume mounted at `/data`
3. If not, create a new volume:
   - Mount Path: `/data`
   - Size: 1GB (minimum)

### 3. Alternative: Use Railway's Built-in Database Path

If Railway provides a DATABASE_URL or specific path, use that instead:

```
DATABASE_PATH=${{RAILWAY_VOLUME_MOUNT_PATH}}/emobile.db
```

### 4. Redeploy

After setting the environment variable:
1. Click "Deploy" in Railway
2. The database will now persist between deployments
3. Products will auto-seed on first deploy only

## Verification

After deployment, check the logs for:
```
🌱 Auto-seeding Railway database...
📦 Database is empty - seeding products and categories...
✅ Seeded category: audio equpment
✅ Seeded product: Wireless Earbuds 📸
```

On subsequent deploys, you should see:
```
🌱 Auto-seeding Railway database...
ℹ️  Database already has 9 products - skipping seed
```

## Current Status

✅ Auto-seed scripts created
✅ Product images included
✅ Categories included
⚠️  Need to configure DATABASE_PATH in Railway

## Next Steps

1. Set `DATABASE_PATH=/data/emobile.db` in Railway environment variables
2. Ensure volume is mounted at `/data`
3. Redeploy
4. Products will persist across deployments
