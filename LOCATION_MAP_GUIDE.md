# 📍 Location Map Icon Guide

## ✅ What Was Added

A **red location map icon** has been added to the main page header that links to Google Maps.

## 📍 Location in Header

The location icon appears in the header navigation:
```
[Language] [Theme] [Phone] [📍 Location] [Login] [Logout] [Cart]
```

## 🎨 Features

- **Red circular icon** with map marker
- **Bouncing animation** to attract attention
- **Opens Google Maps** in new tab when clicked
- **Editable from admin panel**
- **Responsive** on mobile devices

## 🔧 How to Update Location

### Step 1: Get Your Google Maps Link

1. Go to: https://maps.google.com
2. Search for your shop location
3. Click "Share" button
4. Copy the link (e.g., `https://maps.google.com/?q=Your+Shop+Location`)

Or create a custom link:
```
https://maps.google.com/?q=Your+Address+Here
```

### Step 2: Update in Admin Panel

#### Option A: Via Admin Settings Page (If Available)

1. Go to admin panel
2. Find "Settings" section
3. Look for "Location Map URL"
4. Paste your Google Maps link
5. Click "Save"

#### Option B: Via Database (Direct Update)

Run this command in your project folder:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.run('UPDATE settings SET value = ? WHERE key = ?', ['YOUR_GOOGLE_MAPS_URL', 'location_map_url'], (err) => { if (err) console.error(err); else console.log('✅ Updated!'); db.close(); });"
```

Replace `YOUR_GOOGLE_MAPS_URL` with your actual URL.

#### Option C: Via API (For Render)

Use this curl command:
```bash
curl -X PUT https://your-app.onrender.com/api/admin/settings/location_map_url \
  -H "Content-Type: application/json" \
  -d '{"value": "YOUR_GOOGLE_MAPS_URL"}'
```

## 📝 Example Google Maps URLs

### Format 1: Search Query
```
https://maps.google.com/?q=Ermi+Mobile+Shop+Addis+Ababa
```

### Format 2: Coordinates
```
https://maps.google.com/?q=9.0320,38.7469
```

### Format 3: Place ID
```
https://www.google.com/maps/place/?q=place_id:ChIJyWEHuEmoqRkRm9PsYs4RWgM
```

### Format 4: Embed Link
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.7469!3d9.0320
```

## 🎯 Current Default

The location icon currently links to:
```
https://maps.google.com/?q=Addis+Ababa,+Ethiopia
```

## 🚀 Deploy to Render

After updating locally, deploy to Render:

```bash
git add server.js script.js index.html style.css add-location-setting.js
git commit -m "Add location map icon to header"
git push origin main
```

Or use:
```bash
deploy-to-render.bat
```

## 📱 Update Location on Render

### Option 1: Via Render Admin Panel

1. Go to: `https://your-app.onrender.com/admin.html`
2. Login with admin credentials
3. Update location_map_url setting
4. Save

### Option 2: Via Render Shell

1. Go to Render Dashboard
2. Click your service
3. Click "Shell" tab
4. Run:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./emobile.db'); db.run('UPDATE settings SET value = ? WHERE key = ?', ['YOUR_URL', 'location_map_url']);"
```

## ✅ Verify It Works

1. Go to your site (localhost or Render)
2. Look for red location icon in header
3. Click it
4. Should open Google Maps with your location
5. ✅ Done!

## 🎨 Customization

### Change Icon Color

Edit `style.css`:
```css
.location-icon {
    background: #ef4444; /* Change this color */
}
```

### Change Icon

Edit `index.html`:
```html
<i class="fas fa-map-marker-alt"></i> <!-- Change icon class -->
```

Other map icons:
- `fa-map-marked-alt`
- `fa-map-pin`
- `fa-location-arrow`
- `fa-compass`

### Change Animation

Edit `style.css`:
```css
.location-icon i {
    animation: bounce 2s ease-in-out infinite; /* Change animation */
}
```

## 📋 Files Modified

1. **index.html** - Added location icon HTML
2. **style.css** - Added location icon styles
3. **script.js** - Added location URL loading
4. **server.js** - Added location_map_url setting
5. **add-location-setting.js** - Script to add setting to database

## 🎉 Result

Users can now:
- ✅ See your location icon in header
- ✅ Click to open Google Maps
- ✅ Get directions to your shop
- ✅ Find you easily

Perfect for physical stores! 🏪📍
