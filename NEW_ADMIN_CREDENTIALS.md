# New Admin Credentials ✅

## Updated Successfully!

Your admin account has been updated:

### New Admin Account:
```
📧 Email: ermias616@gmail.com
🔑 Password: Ermi@0211
👑 Role: admin
```

### Login Instructions:
1. Go to: https://ermi-mobile.onrender.com/admin-simple.html
2. Enter email: `ermias616@gmail.com`
3. Enter password: `Ermi@0211`
4. Click Login
5. You're now logged in as admin! 👑

---

## What Was Changed

### Local Database (✅ Done):
- ✅ Your account (`ermias616@gmail.com`) upgraded to **admin**
- ✅ Password changed to `Ermi@0211`
- ✅ Old admin email changed to `old-admin@ermimobile.com` (to avoid conflicts)

### For Production (Render):
You need to do the same on Render's database.

---

## Update on Render

### Option 1: Use Render Shell (Recommended)

1. Go to: https://dashboard.render.com
2. Click your service
3. Click **"Shell"** tab
4. Run these commands:

```bash
# Install dependencies if needed
npm install

# Make your account admin
node make-ermias-admin.js
```

### Option 2: Register and Manually Update

1. Go to your live site
2. Register with `ermias616@gmail.com` (if not already registered)
3. Use Render Shell to make it admin:
   ```bash
   node -e "const sqlite3 = require('sqlite3').verbose(); const bcrypt = require('bcrypt'); const db = new sqlite3.Database('./emobile.db'); bcrypt.hash('Ermi@0211', 10).then(hash => { db.run('UPDATE users SET password = ?, role = ? WHERE email = ?', [hash, 'admin', 'ermias616@gmail.com'], (err) => { console.log(err || '✅ Done!'); db.close(); }); });"
   ```

### Option 3: Quick Command (Copy-Paste)

In Render Shell, run:
```bash
node -e "const sqlite3=require('sqlite3').verbose();const bcrypt=require('bcrypt');const db=new sqlite3.Database('./emobile.db');bcrypt.hash('Ermi@0211',10).then(h=>{db.run('UPDATE users SET password=?,role=? WHERE email=?',[h,'admin','ermias616@gmail.com'],(e)=>{console.log(e||'✅ Admin updated!');db.close();});});"
```

---

## Current Admin Accounts

### Your Account (New Admin):
```
Email: ermias616@gmail.com
Password: Ermi@0211
Role: admin
Status: ✅ Active
```

### Old Admin Account:
```
Email: old-admin@ermimobile.com
Password: admin123
Role: admin
Status: ⚠️ Renamed (still works but use new account)
```

### Editor Account:
```
Email: editor@ermimobile.com
Password: editor123
Role: editor
Status: ✅ Active
```

---

## Security Recommendations

### ✅ Strong Password
Your new password `Ermi@0211` is strong:
- Has uppercase letters
- Has lowercase letters
- Has numbers
- Has special characters (@)
- 9 characters long

### 🔒 Keep It Safe
- Don't share your password
- Don't commit it to Git (it's in this file for your reference only)
- Change it periodically
- Use different passwords for different services

---

## Testing

### Test Locally:
1. Go to: http://localhost:3000/admin-simple.html
2. Login with: `ermias616@gmail.com` / `Ermi@0211`
3. Should work! ✅

### Test on Render (After Update):
1. Go to: https://ermi-mobile.onrender.com/admin-simple.html
2. Login with: `ermias616@gmail.com` / `Ermi@0211`
3. Should work! ✅

---

## Files Created

- `make-ermias-admin.js` - Script to make your account admin
- `check-user.js` - Script to check user details
- `update-admin-credentials.js` - General credential update script

---

## Quick Reference

### Login to Admin Panel:
```
URL: https://ermi-mobile.onrender.com/admin-simple.html
Email: ermias616@gmail.com
Password: Ermi@0211
```

### Change Password Later:
```bash
node change-admin-password.js
```

### Make Another User Admin:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', 'user@example.com'], (err) => { console.log(err || '✅ Done'); db.close(); });"
```

---

**Your admin credentials are ready! Login locally works now. Update on Render using the commands above.** 🎉

---
**Date:** 2025-11-22
**Status:** ✅ Local updated | ⏳ Render pending
