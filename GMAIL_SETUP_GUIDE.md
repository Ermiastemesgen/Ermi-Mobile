# Gmail Setup Guide for Email Verification

Follow these steps to enable real email sending with Gmail.

## 📧 Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification
5. You'll need your phone to receive verification codes

## 🔑 Step 2: Generate App Password

1. After enabling 2-Step Verification, go back to **Security**
2. Under "Signing in to Google", click **App passwords**
   - If you don't see this option, make sure 2-Step Verification is enabled
3. Click **Select app** → Choose "Mail"
4. Click **Select device** → Choose "Other (Custom name)"
5. Type "Ermi Mobile" and click **Generate**
6. Google will show you a 16-character password
7. **Copy this password** (you won't see it again!)

## ⚙️ Step 3: Configure Your Application

1. Open the `.env` file in your project folder
2. Replace the placeholder values:

```env
# Email Configuration
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Server Configuration
PORT=3000
NODE_ENV=development

# Your website URL
WEBSITE_URL=http://localhost:3000
```

**Example:**
```env
EMAIL_USER=ermimobile@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

3. Save the file

## 🚀 Step 4: Restart the Server

Stop the current server (Ctrl+C) and restart:

```bash
node server.js
```

You should see:
```
✅ Email server is ready to send messages
```

## ✅ Step 5: Test It!

1. Go to http://localhost:3000/test-email-verification.html
2. Register a new user with a real email address
3. Check your inbox for the verification email
4. Click the verification link
5. Done!

## 🔍 Troubleshooting

### Problem: "Invalid login" error

**Solution:**
- Make sure 2-Step Verification is enabled
- Use the App Password, NOT your regular Gmail password
- Remove any spaces from the App Password in .env file

### Problem: "Less secure app access" error

**Solution:**
- This is an old method that no longer works
- You MUST use App Passwords (requires 2-Step Verification)

### Problem: Email not received

**Check:**
1. Spam/Junk folder
2. Server console for error messages
3. Email address is correct
4. Gmail account has sending limits (500 emails/day for free accounts)

### Problem: "Username and Password not accepted"

**Solution:**
- Double-check EMAIL_USER is your full Gmail address
- Make sure you're using the App Password, not your regular password
- Try generating a new App Password

## 📊 Gmail Sending Limits

**Free Gmail Account:**
- 500 emails per day
- 100 emails per hour
- Perfect for small to medium websites

**Google Workspace (Paid):**
- 2,000 emails per day
- Better for larger businesses

## 🔐 Security Tips

1. **Never commit .env file to Git**
   - It's already in .gitignore
   - Keep your credentials secret

2. **Use different passwords**
   - Don't reuse your main Gmail password
   - App Passwords are safer

3. **Monitor your account**
   - Check Gmail's "Recent security activity"
   - Revoke App Passwords you're not using

## 🌐 Alternative Email Services

If you don't want to use Gmail:

### SendGrid (Recommended for Production)
- Free tier: 100 emails/day
- Better deliverability
- Professional email service

### Mailgun
- Free tier: 5,000 emails/month
- Good for transactional emails

### AWS SES
- Very cheap: $0.10 per 1,000 emails
- Requires AWS account

See EMAIL_VERIFICATION_GUIDE.md for configuration details.

## ✨ Success!

Once configured, your users will receive beautiful verification emails automatically!

**Email Features:**
- ✅ Professional design
- ✅ Mobile-friendly
- ✅ Secure verification links
- ✅ 24-hour expiration
- ✅ Automatic fallback to console if email fails

---

**Need help?** Check the server console for detailed error messages.
