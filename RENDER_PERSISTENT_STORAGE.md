# Fix: Products Disappearing on Render Deploy

## Problem
When Render redeploys your app, the SQLite database (`emobile.db`) gets reset because Render uses ephemeral storage. This causes:
- Products to disappear
- Sample products to reappear
- Images to be lost

## Solution: Add Persistent Disk Storage

### Step 1: Add Disk to Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your web service (Ermi Mobile)
3. Click on **"Disks"** tab in the left sidebar
4. Click **"Add Disk"** button
5. Configure the disk:
   - **Name**: `database-storage`
   - **Mount Path**: `/data`
   - **Size**: 1 GB (free tier includes 1GB)
6. Click **"Save"**

### Step 2: Add Environment Variable

1. Still in your Render service dashboard
2. Go to **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:
   - **Key**: `DATABASE_PATH`
   - **Value**: `/data/emobile.db`
5. Click **"Save Changes"**

### Step 3: Deploy

Render will automatically redeploy with the new configuration.

## What This Does

- **Before**: Database stored in `/app/emobile.db` (ephemeral - deleted on redeploy)
- **After**: Database stored in `/data/emobile.db` (persistent - survives redeploys)

## Verification

After deployment, check your Render logs. You should see:
```
💾 Database: /data/emobile.db
```

## Important Notes

1. **First Deploy After Setup**: Your database will be empty. You'll need to:
   - Add products via admin panel
   - Upload images again

2. **Backup**: The persistent disk is backed up by Render, but you should still:
   - Export products regularly via admin panel
   - Keep backups of important data

3. **Free Tier**: Includes 1GB persistent storage (plenty for your database)

## Alternative: PostgreSQL

If you prefer a more robust solution, you can:
1. Create a free PostgreSQL database on Render
2. Migrate from SQLite to PostgreSQL
3. This requires code changes but is more scalable

## Troubleshooting

**If products still disappear:**
1. Check that the disk is mounted: Go to Render Dashboard → Your Service → Disks
2. Verify environment variable: `DATABASE_PATH=/data/emobile.db`
3. Check logs for database path confirmation

**If you get permission errors:**
- Render automatically handles permissions for the `/data` directory
- If issues persist, contact Render support

## Summary

✅ Code updated to support persistent storage
✅ Add disk in Render dashboard
✅ Set DATABASE_PATH environment variable
✅ Redeploy
✅ Your data will now persist across deployments!
