# Security Dependencies Installation

To enable all security features, you need to install additional npm packages:

## Required Dependencies

```bash
npm install express-rate-limit helmet validator xss
```

## Package Details

1. **express-rate-limit**: Rate limiting middleware for Express
2. **helmet**: Security headers middleware
3. **validator**: Input validation and sanitization
4. **xss**: XSS filtering and sanitization

## Installation Commands

### For Production
```bash
npm install --save express-rate-limit helmet validator xss
```

### For Development
```bash
npm install --save-dev express-rate-limit helmet validator xss
```

## Verification

After installation, restart your server and check the console for:
```
🔒 Security: Enhanced security features enabled
```

## Optional Dependencies (Future Enhancements)

```bash
# For advanced security features
npm install speakeasy qrcode jsonwebtoken
```

- **speakeasy**: Two-factor authentication
- **qrcode**: QR code generation for 2FA
- **jsonwebtoken**: JWT token management

## Note

If you cannot install these dependencies, the basic security features will still work, but some advanced features may be disabled.