# Make Your Account Admin on Render 👑

## The Problem
You're getting "Access denied. Admin or editor privileges required" because your account on Render is still a regular user, not admin.

## Solution: Run This on Render Shell

### Step 1: Go to Render Shell
1. Go to: https://dashboard.render.com
2. Click your "ermi-mobile" service
3. Click **"Shell"** tab (in the left sidebar)

### Step 2: Run This Command

Copy and paste this **ONE command** (all on one line):

```bash
node -e "const sqlite3=require('sqlite3').verbose();const bcrypt=require('bcrypt');const db=new sqlite3.Database('./emobile.db');bcrypt.hash('Ermi@0211',10).then(h=>{db.run('UPDATE users SET password=?,role=? WHERE email=?',[h,'admin','ermias616@gmail.com'],(e)=>{if(e)console.log('Error:',e);else console.log('✅ ermias616@gmail.com is now ADMIN!');db.close();});});"
```

### Step 3: Wait for Success Message
You should see:
```
✅ ermias616@gmail.com is now ADMIN!
```

### Step 4: Try Logging In Again
1. Go to: https://ermi-mobile.onrender.com/admin-simple.html
2. Login with:
   - Email: `ermias616@gmail.com`
   - Password: `Ermi@0211`
3. Should work now! ✅

---

## Alternative: If Account Doesn't Exist on Render

If you haven't registered on Render yet:

### Option 1: Register First
1. Go to: https://ermi-mobile.onrender.com
2. Click "Register"
3. Register with: `ermias616@gmail.com` and password `Ermi@0211`
4. Then run the command above in Render Shell

### Option 2: Use Default Admin
Login with the default admin account:
```
Email: old-admin@ermimobile.com
Password: admin123
```

Then create your account from the admin panel.

---

## Quick Check: See All Users

To see all users and their roles on Render, run this in Shell:

```bash
node -e "const sqlite3=require('sqlite3').verbose();const db=new sqlite3.Database('./emobile.db');db.all('SELECT id,name,email,role FROM users',(e,r)=>{console.table(r);db.close();});"
```

This shows you all accounts and their roles.

---

## Make Any User Admin

To make any other user admin, use this template:

```bash
node -e "const sqlite3=require('sqlite3').verbose();const db=new sqlite3.Database('./emobile.db');db.run('UPDATE users SET role=? WHERE email=?',['admin','USER_EMAIL_HERE'],(e)=>{console.log(e||'✅ Done!');db.close();});"
```

Replace `USER_EMAIL_HERE` with the email address.

---

## Troubleshooting

### "User not found"
- The account doesn't exist on Render
- Register first, then run the command

### "Command not found"
- Make sure you're in the Render Shell
- Not your local terminal

### Still getting "Access denied"
1. Clear browser cache (Ctrl + Shift + Delete)
2. Logout from admin panel
3. Login again with your credentials

---

## Summary

**Quick Fix:**
1. Open Render Shell
2. Run the command above
3. Login to admin panel
4. Done! ✅

**The command makes `ermias616@gmail.com` an admin with password `Ermi@0211`**

---
**Date:** 2025-11-22
**Status:** Run command in Render Shell to fix
