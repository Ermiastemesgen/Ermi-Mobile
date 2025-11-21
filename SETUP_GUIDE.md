# Setup Guide for Ermi Mobile

## Step 1: Install Node.js

Node.js is required to run the server. Follow these steps:

### Windows Installation:

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the **LTS version** (recommended)
   - Choose the Windows Installer (.msi)

2. **Install Node.js:**
   - Run the downloaded installer
   - Click "Next" through the installation wizard
   - Accept the license agreement
   - Keep default installation path
   - Make sure "Add to PATH" is checked
   - Click "Install"

3. **Verify Installation:**
   - Open a **NEW** Command Prompt or PowerShell window
   - Type: `node --version`
   - Type: `npm --version`
   - Both should show version numbers

## Step 2: Install Project Dependencies

After Node.js is installed:

```bash
npm install
```

This will install:
- express (web server)
- sqlite3 (database)
- bcrypt (password encryption)
- cors (API security)
- body-parser (request handling)

## Step 3: Start the Server

```bash
npm start
```

You should see:
```
🚀 Ermi Mobile Server is running!
📍 Local: http://localhost:3000
💾 Database: emobile.db
```

## Step 4: Open the Website

Open your browser and go to:
```
http://localhost:3000
```

## Troubleshooting

### "npm is not recognized"
- Make sure Node.js is installed
- Restart your terminal/command prompt
- Check if Node.js is in your PATH

### Port 3000 already in use
- Change the PORT in server.js (line 9)
- Or stop the other application using port 3000

### Database errors
- Delete `emobile.db` file and restart the server
- The database will be recreated automatically

## Quick Start (After Node.js is installed)

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# 3. Open browser
# Go to: http://localhost:3000
```

## Testing the Website

1. **Browse Products** - View all 6 mobile accessories
2. **Add to Cart** - Click "Add to Cart" on any product
3. **View Cart** - Click the cart icon in header
4. **Login** - Click "Login" and enter any email/password
5. **Checkout** - Complete your order

## Need Help?

If you encounter any issues:
1. Make sure Node.js is properly installed
2. Check that port 3000 is available
3. Look at the server console for error messages
4. Try deleting `node_modules` folder and run `npm install` again

---

**Enjoy your Ermi Mobile shop! 🚀**
