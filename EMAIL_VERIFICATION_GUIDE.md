# Email Verification Setup Guide

Email verification has been added to Ermi Mobile! Users must verify their email before they can log in.

## 🎯 What's New

- Users receive a verification email after registration
- Login is blocked until email is verified
- Verification links expire after 24 hours
- Users can request a new verification email

## 📧 Email Configuration

### Development Mode (Current Setup)
In development, verification links are printed to the console instead of being emailed.

When a user registers, check the server console for:
```
📧 EMAIL VERIFICATION LINK (Development Mode):
User: John Doe (john@example.com)
Link: http://localhost:3000/verify-email?token=abc123...
Copy this link to verify the email
```

### Production Mode (Real Emails)

To send real emails in production, you need to configure email credentials:

#### Option 1: Using Gmail

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Go to App Passwords
   - Generate a password for "Mail"
   
3. **Set Environment Variables:**
   ```bash
   export EMAIL_USER="your-email@gmail.com"
   export EMAIL_PASS="your-app-password"
   ```

#### Option 2: Using Other Email Services

Update `server.js` email configuration:

**For SendGrid:**
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});
```

**For Mailgun:**
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASS
    }
});
```

**For AWS SES:**
```javascript
const transporter = nodemailer.createTransport({
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    auth: {
        user: process.env.AWS_SES_USER,
        pass: process.env.AWS_SES_PASS
    }
});
```

## 🔄 How It Works

### 1. User Registration
```javascript
// User fills registration form
POST /api/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}

// Response
{
    "success": true,
    "message": "Registration successful! Please check your email to verify your account.",
    "userId": 123
}
```

### 2. Email Verification
- User receives email with verification link
- Clicks link: `http://yourdomain.com/verify-email?token=abc123...`
- Account is verified
- User can now log in

### 3. Login Attempt (Unverified)
```javascript
POST /api/login
{
    "email": "john@example.com",
    "password": "password123"
}

// Response (if not verified)
{
    "error": "Please verify your email before logging in.",
    "emailNotVerified": true
}
```

### 4. Resend Verification Email
```javascript
POST /api/resend-verification
{
    "email": "john@example.com"
}

// Response
{
    "success": true,
    "message": "Verification email sent! Please check your inbox."
}
```

## 🛠️ Testing Email Verification

### Method 1: Console Links (Development)
1. Register a new user
2. Check server console for verification link
3. Copy and paste link in browser
4. Email is verified!

### Method 2: Using Mailtrap (Testing)
Mailtrap catches emails without sending them:

1. Sign up at https://mailtrap.io (free)
2. Get SMTP credentials
3. Update server.js:
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: 'your-mailtrap-user',
        pass: 'your-mailtrap-pass'
    }
});
```

## 📝 Database Changes

New columns added to `users` table:
- `email_verified` (INTEGER) - 0 = not verified, 1 = verified
- `verification_token` (TEXT) - Unique token for verification
- `verification_token_expires` (DATETIME) - Token expiration time

## 🎨 Frontend Integration

Add a "Resend Verification Email" button to your login page:

```html
<div id="verificationMessage" style="display: none;">
    <p>Email not verified. <button onclick="resendVerification()">Resend Verification Email</button></p>
</div>

<script>
async function resendVerification() {
    const email = document.getElementById('loginEmail').value;
    
    const response = await fetch('http://localhost:3000/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    alert(data.message);
}

// Show verification message on login error
async function handleLogin(email, password) {
    const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.emailNotVerified) {
        document.getElementById('verificationMessage').style.display = 'block';
    }
}
</script>
```

## 🔒 Security Features

- Tokens are cryptographically secure (32 bytes random)
- Tokens expire after 24 hours
- Tokens are deleted after successful verification
- Passwords are hashed before storage
- Existing users are automatically verified (backward compatibility)

## 🚀 Deployment Considerations

### Environment Variables
Create a `.env` file:
```
PORT=3000
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Update Verification URL
In production, update the verification URL in `server.js`:
```javascript
const verificationUrl = `https://yourdomain.com/verify-email?token=${token}`;
```

## 📊 Monitoring

Check verification status:
```sql
-- Count verified vs unverified users
SELECT 
    email_verified,
    COUNT(*) as count
FROM users
GROUP BY email_verified;

-- Find users with expired tokens
SELECT name, email, verification_token_expires
FROM users
WHERE email_verified = 0
AND verification_token_expires < datetime('now');
```

## 🐛 Troubleshooting

**Problem:** Emails not sending
- Check EMAIL_USER and EMAIL_PASS environment variables
- Verify Gmail App Password is correct
- Check server console for error messages

**Problem:** Verification link expired
- User can request new verification email
- Use `/api/resend-verification` endpoint

**Problem:** Can't log in after verification
- Check database: `SELECT email_verified FROM users WHERE email = 'user@example.com'`
- Should be 1 (verified)

## 📞 Support

For issues or questions:
1. Check server console logs
2. Verify database schema with `add-email-verification.js`
3. Test with development mode first (console links)

---

**Email verification is now active! 🎉**
