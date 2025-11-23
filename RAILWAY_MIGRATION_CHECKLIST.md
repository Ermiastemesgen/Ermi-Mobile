# Railway Migration Checklist

## ✅ Pre-Migration (Done by script)
- [x] Created railway.json configuration
- [x] Generated environment variables template
- [x] Verified project structure

## 📋 Manual Steps Required

### 1. Backup Current Data
- [ ] Export products from Render admin panel
- [ ] Save any important data
- [ ] Note down current Render URL

### 2. Deploy to Railway
- [ ] Go to https://railway.app
- [ ] Sign up/login with GitHub
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select this repository: e-mobile-shop
- [ ] Wait for initial deployment

### 3. Configure Environment Variables
- [ ] Go to Railway dashboard → Variables tab
- [ ] Copy variables from railway-env-template.txt
- [ ] Update with your actual values
- [ ] Save all variables

### 4. Test Deployment
- [ ] Visit your Railway URL
- [ ] Test admin login: ermias616@gmail.com
- [ ] Verify all pages load correctly
- [ ] Test product creation/editing

### 5. Migrate Data
- [ ] Add your products via Railway admin panel
- [ ] Upload product images
- [ ] Test hero slider functionality
- [ ] Verify user registration/login

### 6. Update DNS (if using custom domain)
- [ ] Update domain DNS to point to Railway
- [ ] Configure custom domain in Railway dashboard
- [ ] Wait for SSL certificate

### 7. Final Steps
- [ ] Update bookmarks to new Railway URL
- [ ] Inform users of new URL (if needed)
- [ ] Monitor Railway deployment logs
- [ ] Delete Render service (optional)

## 🎯 Railway URLs (after deployment)
- Main site: https://your-project.railway.app
- Admin panel: https://your-project.railway.app/admin-simple.html
- Profile page: https://your-project.railway.app/profile.html

## 🆘 Need Help?
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions
