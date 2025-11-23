# Fix Email Verification on Render 📧

## The Problem
Email verification says "sent" but emails don't arrive in inbox because email credentials are not configured in Render.

## Solution: Add Email Credentials to Render

### Step 1: Check Your Email Credentials

Your email credentials are in `.env` file:
```
EMAIL_USER=real64377@gmail.com
EMAIL_PASS=ylmghokmxfzlrnrr
```

These need to be added to Render.

---

### Step 2: Add to Render Environment Variables

1. Go to: **https://dashboard.render.com**
2. Click your **"ermi-mobile"** service
3. Click **"Environment"** in the left sidebar
4. Click **"Add Environment Variable"**

---

### Step 3: Add Email User

**Key:** `EMAIL_USER`
**Value:** `real64377@gmail.com`

Click "Add" or press Enter

---

### Step 4: Add Email Password

**Key:** `EMAIL_PASS`
**Value:** `ylmghokmxfzlrnrr`

Click "Add" or press Enter

---

### Step 5: Add Website URL

**Key:** `WEBSITE_URL`
**Value:** `https://ermi-mobile.onrender.com`

Click "Add" or press Enter

---

### Step 6: Save and Deploy

1. Click **"Save Changes"**
2. Render will auto-redeploy (2-3 minutes)
3. Wait for deployment to complete

---

## After Deployment

### Test Email Verification:

1. Go to: https://ermi-mobile.onrender.com
2. Click "Register" or "Sign Up"
3. Create a new account with a real email
4. Check your email inbox (and spam folder!)
5. Click the verification link

---

## Check Render Logs

After registering a user, check Render logs for:

**Good signs:**
```
📧 Email configured (will verify on first use)
✅ Verification email sent to: user@example.com
📧 Message ID: <some-id>
```

**If email not configured:**
```
📧 Email not configured - verification links will be logged to console
📧 EMAIL VERIFICATION LINK (Development Mode):
Link: https://ermi-mobile.onrender.com/verify-email?token=...
```

---

## Important Notes

### Gmail App Password
The password `ylmghokmxfzlrnrr` is a Gmail **App Password**, not your regular Gmail password.

If this doesn't work:
1. Go to: https://myaccount.google.com/apppasswords
2. Generate a new App Password
3. Update `EMAIL_PASS` in Render with the new password

### Check Spam Folder
Gmail might mark verification emails as spam initially. Check:
- Inbox
- Spam folder
- Promotions tab

### Email Delivery Time
- Usually instant (1-5 seconds)
- Can take up to 1 minute
- If not received after 2 minutes, check logs

---

## Troubleshooting

### Email says "sent" but not received:

1. **Check Render logs** - Look for actual send confirmation
2. **Check spam folder** - Gmail might filter it
3. **Verify credentials** - Make sure EMAIL_USER and EMAIL_PASS are correct
4. **Check Gmail settings** - Make sure "Less secure app access" is enabled (if needed)
5. **Try different email** - Test with another email address

### Error in logs: "Invalid login"

- App Password is wrong or expired
- Generate new App Password at: https://myaccount.google.com/apppasswords
- Update EMAIL_PASS in Render

### Error: "Connection timeout"

- Gmail might be blocking the connection
- Check if 2-Step Verification is enabled
- Make sure you're using App Password, not regular password

---

## Environment Variables Checklist

After adding, you should have these in Render:

```
✅ CLOUDINARY_CLOUD_NAME = (your cloud name)
✅ CLOUDINARY_API_KEY = (your API key)
✅ CLOUDINARY_API_SECRET = (your API secret)
✅ EMAIL_USER = real64377@gmail.com
✅ EMAIL_PASS = ylmghokmxfzlrnrr
✅ WEBSITE_URL = https://ermi-mobile.onrender.com
```

Optional (if you have them):
```
PORT = 3000
NODE_ENV = production
```

---

## Alternative: Manual Verification

If email still doesn't work, you can manually verify users in the database:

1. User registers
2. Check Render logs for verification link
3. Copy the link and send it to the user manually
4. Or update database directly:
   ```sql
   UPDATE users SET email_verified = 1 WHERE email = 'user@example.com';
   ```

---

## Quick Test

After adding email credentials:

1. Register with your own email
2. Check Render logs immediately
3. Look for "✅ Verification email sent"
4. Check your email inbox
5. Click verification link
6. Should see "✅ Email Verified!" page

---

**Add the 3 email environment variables to Render and test!** 📧

Let me know if emails start arriving after deployment!

---
**Date:** 2025-11-22
**Status:** Waiting for email credentials to be added to Render
