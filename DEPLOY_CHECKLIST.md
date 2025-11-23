# Deployment Checklist ✅

## Before Deploying

### 1. Update Local .env File
Open `.env` and replace these lines with your actual Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here  ← Replace this
CLOUDINARY_API_KEY=your_api_key_here        ← Replace this
CLOUDINARY_API_SECRET=your_api_secret_here  ← Replace this
```

**Get credentials from:** https://cloudinary.com/console

---

### 2. Add Credentials to Render

Go to: https://dashboard.render.com

1. Click on your "ermi-mobile" service
2. Click "Environment" in left sidebar
3. Click "Add Environment Variable"
4. Add these 3 variables:

| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `CLOUDINARY_API_KEY` | Your API key |
| `CLOUDINARY_API_SECRET` | Your API secret |

5. Click "Save Changes"

---

### 3. Deploy to Render

Run this command:

```bash
git push origin main
```

That's it! Render will automatically deploy.

---

## After Deployment (2-3 minutes)

### 1. Check Deployment Status
- Go to Render dashboard
- Wait for "Deploy live" status
- Check logs for: `☁️  Cloudinary configured for image storage`

### 2. Test Image Upload
1. Go to: https://ermi-mobile.onrender.com/admin-simple.html
2. Login with admin credentials
3. Create or edit a product
4. Upload an image
5. Image should display immediately ✅

### 3. Verify in Cloudinary
1. Go to: https://cloudinary.com/console/media_library
2. Look for "ermi-mobile" folder
3. Your uploaded images should be there

---

## Quick Reference

### Your Cloudinary Credentials
You can find these at: https://cloudinary.com/console

```
Cloud Name: ___________________
API Key:    ___________________
API Secret: ___________________
```

### Render Environment Variables
Add these at: https://dashboard.render.com → Your Service → Environment

```
CLOUDINARY_CLOUD_NAME = (paste cloud name)
CLOUDINARY_API_KEY = (paste API key)
CLOUDINARY_API_SECRET = (paste API secret)
```

---

## What Happens Next

1. ✅ You add Cloudinary credentials to Render
2. ✅ You push code to GitHub
3. ✅ Render auto-deploys (2-3 min)
4. ✅ Images upload to Cloudinary
5. ✅ Images persist forever
6. ✅ Fast CDN delivery worldwide

---

## Need Help?

If images still don't show after deployment:
1. Check Render logs for errors
2. Verify all 3 environment variables are set
3. Clear browser cache (Ctrl + Shift + Delete)
4. Check Cloudinary dashboard for uploaded images

---

**Ready to deploy?** Just add your Cloudinary credentials and push! 🚀
