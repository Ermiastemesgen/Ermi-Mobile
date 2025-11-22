# Change Admin Password 🔐

## Method 1: Using Script (Recommended)

### Run the password change script:

```bash
node change-admin-password.js
```

### Follow the prompts:
1. Enter admin email (or press Enter for default: `admin@ermimobile.com`)
2. Enter new password (minimum 6 characters)
3. Done! ✅

---

## Method 2: Quick Command

### Change admin password directly:

```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const bcrypt = require('bcrypt'); const db = new sqlite3.Database('./emobile.db'); bcrypt.hash('YOUR_NEW_PASSWORD', 10).then(hash => { db.run('UPDATE users SET password = ? WHERE email = ?', [hash, 'admin@ermimobile.com'], function(err) { if (err) console.error(err); else console.log('✅ Password updated!'); db.close(); }); });"
```

**Replace `YOUR_NEW_PASSWORD` with your desired password**

---

## Method 3: Create New Admin Account

If you want to create a completely new admin account:

### Create file: `create-new-admin.js`

```javascript
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./emobile.db');

const newAdmin = {
    name: 'Your Name',
    email: 'your-email@example.com',
    password: 'your-secure-password',
    role: 'admin'
};

bcrypt.hash(newAdmin.password, 10).then(hashedPassword => {
    db.run(
        'INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, 1)',
        [newAdmin.name, newAdmin.email, hashedPassword, newAdmin.role],
        function(err) {
            if (err) {
                console.error('❌ Error:', err.message);
            } else {
                console.log('✅ New admin created!');
                console.log('📧 Email:', newAdmin.email);
                console.log('🔑 Password:', newAdmin.password);
            }
            db.close();
        }
    );
});
```

Then run:
```bash
node create-new-admin.js
```

---

## Method 4: Via Admin Panel (Future Feature)

You can add a password change feature to the admin panel:

### Add to admin-simple.html:

```html
<button onclick="changePassword()">Change Password</button>
```

### Add JavaScript:

```javascript
async function changePassword() {
    const currentPassword = prompt('Enter current password:');
    const newPassword = prompt('Enter new password (min 6 characters):');
    const confirmPassword = prompt('Confirm new password:');
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters!');
        return;
    }
    
    try {
        const response = await fetch(API + '/admin/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@ermimobile.com',
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Password changed successfully!');
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}
```

---

## Current Admin Credentials

### Default Admin Account:
```
Email: admin@ermimobile.com
Password: admin123
```

### After Changing:
```
Email: admin@ermimobile.com
Password: [your new password]
```

---

## Security Best Practices

### Strong Password Guidelines:
- ✅ At least 8-12 characters
- ✅ Mix of uppercase and lowercase
- ✅ Include numbers
- ✅ Include special characters (!@#$%^&*)
- ✅ Don't use common words
- ✅ Don't use personal information

### Examples of Strong Passwords:
- `MyShop2024!Secure`
- `Admin#Pass@2024`
- `Ermi$Mobile!123`

---

## Quick Steps

### To change password NOW:

1. **Open terminal in your project folder**

2. **Run:**
   ```bash
   node change-admin-password.js
   ```

3. **Enter:**
   - Email: `admin@ermimobile.com` (or press Enter)
   - New password: `your-secure-password`

4. **Done!** ✅

---

## For Production (Render)

### Option 1: Change Locally, Then Deploy
1. Change password locally using the script
2. The database will be updated
3. Deploy to Render
4. New password will work on production

### Option 2: Use Render Shell
1. Go to Render Dashboard
2. Click your service
3. Click "Shell" tab
4. Run: `node change-admin-password.js`
5. Follow prompts

### Option 3: Create New Admin via Registration
1. Register a new account on your site
2. Manually update the database to make it admin:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-new-email@example.com';
   ```

---

## Troubleshooting

### "User not found"
- Check the email is correct
- Default is: `admin@ermimobile.com`

### "Password too short"
- Password must be at least 6 characters
- Recommended: 8+ characters

### "Database locked"
- Stop the server first: `Ctrl + C`
- Then run the password change script
- Restart server after

---

## Quick Reference

### Change Password:
```bash
node change-admin-password.js
```

### Check Current Admin:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.get('SELECT email, role FROM users WHERE role = \"admin\"', (err, row) => { console.log(row); db.close(); });"
```

### List All Admins:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.all('SELECT id, name, email, role FROM users WHERE role = \"admin\"', (err, rows) => { console.log(rows); db.close(); });"
```

---

**Run `node change-admin-password.js` now to change your admin password!** 🔐

---
**Date:** 2025-11-22
**Status:** Password change tool ready
