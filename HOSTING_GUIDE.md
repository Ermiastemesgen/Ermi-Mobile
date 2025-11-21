# Hosting Guide for Ermi Mobile

This guide will help you deploy your Ermi Mobile website to the internet so customers can access it online.

## 🌐 Hosting Options

### Option 1: Render.com (Recommended - FREE)
**Best for:** Small to medium businesses, easy setup, free tier available

#### Steps:
1. **Prepare Your Code**
   - Create a GitHub account at https://github.com
   - Install Git on your computer
   - Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git
   git push -u origin main
   ```

2. **Deploy to Render**
   - Go to https://render.com and sign up (free)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** ermi-mobile
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Plan:** Free
   - Click "Create Web Service"
   - Your site will be live at: `https://ermi-mobile.onrender.com`

3. **Important Notes:**
   - Free tier sleeps after 15 minutes of inactivity
   - First load after sleep takes 30-60 seconds
   - Upgrade to paid plan ($7/month) for always-on service

---

### Option 2: Railway.app (Easy & Fast)
**Best for:** Quick deployment, generous free tier

#### Steps:
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js and deploys
6. Get your URL: `https://ermi-mobile.up.railway.app`

**Free Tier:** $5 credit/month (enough for small sites)

---

### Option 3: Heroku (Popular Choice)
**Best for:** Established platform, many add-ons

#### Steps:
1. Sign up at https://heroku.com
2. Install Heroku CLI
3. In your project folder:
   ```bash
   heroku login
   heroku create ermi-mobile
   git push heroku main
   ```
4. Your site: `https://ermi-mobile.herokuapp.com`

**Cost:** Free tier discontinued, starts at $5/month

---

### Option 4: VPS Hosting (Full Control)
**Best for:** Growing businesses, custom requirements

#### Recommended Providers:
- **DigitalOcean** - $4/month droplet
- **Linode** - $5/month
- **Vultr** - $2.50/month
- **AWS Lightsail** - $3.50/month

#### Setup Steps:
1. Create a VPS (Ubuntu 22.04 recommended)
2. SSH into your server
3. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Install PM2 (process manager):
   ```bash
   sudo npm install -g pm2
   ```
5. Upload your files (using FileZilla or SCP)
6. Install dependencies:
   ```bash
   cd /var/www/ermi-mobile
   npm install
   ```
7. Start with PM2:
   ```bash
   pm2 start server.js --name ermi-mobile
   pm2 startup
   pm2 save
   ```
8. Configure Nginx as reverse proxy
9. Add SSL certificate (free with Let's Encrypt)

---

### Option 5: Shared Hosting (Budget Option)
**Best for:** Very small businesses, limited budget

#### Providers:
- **Hostinger** - $2/month
- **Namecheap** - $2/month
- **Bluehost** - $3/month

**Note:** Most shared hosting doesn't support Node.js well. You may need to use their Node.js app feature or upgrade to VPS.

---

## 📝 Pre-Deployment Checklist

Before deploying, make sure to:

1. **Update Environment Variables**
   - Create a `.env` file:
   ```
   PORT=3000
   NODE_ENV=production
   DATABASE_URL=./emobile.db
   ```

2. **Add to .gitignore**
   ```
   node_modules/
   .env
   emobile.db
   uploads/
   ```

3. **Update server.js for Production**
   - Change port to use environment variable:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```

4. **Database Considerations**
   - SQLite works for small sites
   - For larger sites, consider PostgreSQL or MySQL
   - Backup your database regularly

5. **Security Updates**
   - Add helmet.js for security headers
   - Enable HTTPS/SSL
   - Set secure session secrets
   - Add rate limiting

---

## 🔒 Adding SSL Certificate (HTTPS)

### For VPS:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### For Render/Railway/Heroku:
SSL is automatically provided for free!

---

## 🌍 Custom Domain Setup

1. **Buy a domain** (from Namecheap, GoDaddy, etc.)
2. **Point to your hosting:**
   - For Render: Add CNAME record pointing to your Render URL
   - For VPS: Add A record pointing to your server IP
3. **Update DNS settings** (takes 24-48 hours to propagate)

---

## 📊 Monitoring & Maintenance

### Recommended Tools:
- **Uptime monitoring:** UptimeRobot (free)
- **Error tracking:** Sentry (free tier)
- **Analytics:** Google Analytics (free)
- **Backups:** Daily database backups

### Backup Script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp emobile.db backups/emobile_$DATE.db
```

---

## 💰 Cost Comparison

| Provider | Free Tier | Paid Plan | Best For |
|----------|-----------|-----------|----------|
| Render | ✅ Yes (with limits) | $7/month | Beginners |
| Railway | $5 credit/month | $5+/month | Quick deploy |
| Heroku | ❌ No | $5/month | Established apps |
| DigitalOcean | ❌ No | $4/month | Full control |
| Shared Hosting | Sometimes | $2-5/month | Very small sites |

---

## 🚀 Quick Start (Render - Recommended)

1. Create GitHub account
2. Push code to GitHub
3. Sign up at Render.com
4. Connect GitHub repo
5. Deploy (automatic)
6. Done! Your site is live

**Total Time:** 15-30 minutes  
**Cost:** FREE

---

## 📞 Need Help?

Common issues:
- **Port already in use:** Change PORT in environment variables
- **Database not found:** Ensure emobile.db is uploaded
- **Images not loading:** Check uploads folder permissions
- **Site is slow:** Upgrade to paid tier or optimize database

---

## 🎯 Recommended Setup for Ermi Mobile

**For Starting Out:**
- Use **Render.com** (free tier)
- Add custom domain later
- Monitor with UptimeRobot

**For Growing Business:**
- Upgrade to **DigitalOcean VPS** ($4/month)
- Add SSL certificate
- Set up automated backups
- Use PM2 for process management

**For Established Business:**
- Use **AWS** or **DigitalOcean**
- Add CDN (Cloudflare)
- Use PostgreSQL database
- Implement load balancing

---

**Good luck with your deployment! 🚀**
