// ===== SERVER-SIDE SECURITY MIDDLEWARE =====
// Add this to your server.js file

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const xss = require('xss');

// ===== Security Configuration =====
const SECURITY_CONFIG = {
    // Rate limiting
    GENERAL_RATE_LIMIT: 100, // requests per 15 minutes
    LOGIN_RATE_LIMIT: 5, // login attempts per 15 minutes
    API_RATE_LIMIT: 60, // API requests per minute
    
    // Session security
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
    
    // Password requirements
    MIN_PASSWORD_LENGTH: 8,
    REQUIRE_STRONG_PASSWORD: true,
    
    // Admin security
    ADMIN_IP_WHITELIST: [], // Add IPs if needed
    REQUIRE_ADMIN_2FA: false, // Can be enabled later
    
    // File upload security
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    
    // Audit logging
    LOG_ALL_REQUESTS: true,
    LOG_FAILED_ATTEMPTS: true,
    LOG_ADMIN_ACTIONS: true
};

// ===== Security State Management =====
class ServerSecurityManager {
    constructor() {
        this.loginAttempts = new Map();
        this.activeSessions = new Map();
        this.auditLog = [];
        this.suspiciousIPs = new Set();
    }

    // ===== Rate Limiting Middleware =====
    createRateLimiters() {
        // General rate limiter
        const generalLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: SECURITY_CONFIG.GENERAL_RATE_LIMIT,
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    endpoint: req.path
                });
                res.status(429).json({
                    error: 'Too many requests from this IP, please try again later.',
                    retryAfter: '15 minutes'
                });
            }
        });

        // Login rate limiter
        const loginLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: SECURITY_CONFIG.LOGIN_RATE_LIMIT,
            skipSuccessfulRequests: true,
            message: {
                error: 'Too many login attempts from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            handler: (req, res) => {
                this.logSecurityEvent('LOGIN_RATE_LIMIT_EXCEEDED', {
                    ip: req.ip,
                    email: req.body.email,
                    userAgent: req.get('User-Agent')
                });
                res.status(429).json({
                    error: 'Too many login attempts from this IP, please try again later.',
                    retryAfter: '15 minutes'
                });
            }
        });

        // API rate limiter
        const apiLimiter = rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: SECURITY_CONFIG.API_RATE_LIMIT,
            message: {
                error: 'Too many API requests, please slow down.',
                retryAfter: '1 minute'
            }
        });

        return { generalLimiter, loginLimiter, apiLimiter };
    }

    // ===== Security Headers Middleware =====
    setupSecurityHeaders(app) {
        // Use Helmet for security headers
        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
                    imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
                    connectSrc: ["'self'", "*"]
                }
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        }));

        // Additional security headers
        app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
            next();
        });
    }

    // ===== Input Validation Middleware =====
    createInputValidators() {
        const validateEmail = (req, res, next) => {
            if (req.body.email) {
                if (!validator.isEmail(req.body.email)) {
                    this.logSecurityEvent('INVALID_EMAIL_FORMAT', {
                        ip: req.ip,
                        email: req.body.email
                    });
                    return res.status(400).json({ error: 'Invalid email format' });
                }
                req.body.email = validator.normalizeEmail(req.body.email);
            }
            next();
        };

        const validatePassword = (req, res, next) => {
            if (req.body.password) {
                const password = req.body.password;
                
                if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
                    return res.status(400).json({ 
                        error: `Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters long` 
                    });
                }

                if (SECURITY_CONFIG.REQUIRE_STRONG_PASSWORD) {
                    const validation = this.validateStrongPassword(password);
                    if (!validation.isValid) {
                        return res.status(400).json({ 
                            error: 'Password does not meet security requirements',
                            requirements: validation.errors
                        });
                    }
                }
            }
            next();
        };

        const sanitizeInput = (req, res, next) => {
            // Sanitize string inputs
            for (const key in req.body) {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = xss(req.body[key]);
                }
            }
            next();
        };

        return { validateEmail, validatePassword, sanitizeInput };
    }

    // ===== Authentication Middleware =====
    createAuthMiddleware() {
        const requireAuth = (req, res, next) => {
            const user = req.user; // Assuming you have user in request
            
            if (!user) {
                this.logSecurityEvent('UNAUTHORIZED_ACCESS', {
                    ip: req.ip,
                    endpoint: req.path,
                    userAgent: req.get('User-Agent')
                });
                return res.status(401).json({ error: 'Authentication required' });
            }
            
            next();
        };

        const requireAdmin = (req, res, next) => {
            const user = req.user;
            
            if (!user || user.role !== 'admin') {
                this.logSecurityEvent('ADMIN_ACCESS_DENIED', {
                    ip: req.ip,
                    user: user ? user.email : 'anonymous',
                    endpoint: req.path
                });
                return res.status(403).json({ error: 'Admin access required' });
            }

            // Check IP whitelist if configured
            if (SECURITY_CONFIG.ADMIN_IP_WHITELIST.length > 0) {
                if (!SECURITY_CONFIG.ADMIN_IP_WHITELIST.includes(req.ip)) {
                    this.logSecurityEvent('ADMIN_IP_BLOCKED', {
                        ip: req.ip,
                        user: user.email
                    });
                    return res.status(403).json({ error: 'Access denied from this IP address' });
                }
            }

            this.logSecurityEvent('ADMIN_ACCESS_GRANTED', {
                ip: req.ip,
                user: user.email,
                endpoint: req.path
            });
            
            next();
        };

        return { requireAuth, requireAdmin };
    }

    // ===== Login Security =====
    checkLoginAttempts(email, ip) {
        const key = `${email}_${ip}`;
        const attempts = this.loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
        const now = Date.now();
        
        // Reset attempts if lockout time has passed
        if (now - attempts.lastAttempt > SECURITY_CONFIG.LOCKOUT_TIME) {
            attempts.count = 0;
        }
        
        if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
            const remainingTime = Math.ceil((SECURITY_CONFIG.LOCKOUT_TIME - (now - attempts.lastAttempt)) / 60000);
            throw new Error(`Too many failed login attempts. Please try again in ${remainingTime} minutes.`);
        }
        
        return true;
    }

    recordFailedLogin(email, ip) {
        const key = `${email}_${ip}`;
        const attempts = this.loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = Date.now();
        this.loginAttempts.set(key, attempts);
        
        this.logSecurityEvent('FAILED_LOGIN', {
            email: email,
            ip: ip,
            attempts: attempts.count
        });

        // Add to suspicious IPs if too many attempts
        if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
            this.suspiciousIPs.add(ip);
        }
    }

    recordSuccessfulLogin(email, ip) {
        const key = `${email}_${ip}`;
        this.loginAttempts.delete(key);
        
        this.logSecurityEvent('SUCCESSFUL_LOGIN', {
            email: email,
            ip: ip
        });
    }

    // ===== Password Validation =====
    validateStrongPassword(password) {
        const errors = [];
        
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        // Check for common weak passwords
        const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
        if (weakPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common. Please choose a stronger password');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // ===== File Upload Security =====
    createFileUploadSecurity() {
        const validateFileUpload = (req, res, next) => {
            if (req.file) {
                // Check file size
                if (req.file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
                    this.logSecurityEvent('FILE_SIZE_EXCEEDED', {
                        ip: req.ip,
                        filename: req.file.originalname,
                        size: req.file.size
                    });
                    return res.status(400).json({ error: 'File size too large' });
                }

                // Check file type
                if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(req.file.mimetype)) {
                    this.logSecurityEvent('INVALID_FILE_TYPE', {
                        ip: req.ip,
                        filename: req.file.originalname,
                        mimetype: req.file.mimetype
                    });
                    return res.status(400).json({ error: 'Invalid file type' });
                }

                // Sanitize filename
                req.file.originalname = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            }
            next();
        };

        return { validateFileUpload };
    }

    // ===== Audit Logging =====
    createAuditMiddleware() {
        const auditLogger = (req, res, next) => {
            if (SECURITY_CONFIG.LOG_ALL_REQUESTS) {
                this.logSecurityEvent('REQUEST', {
                    method: req.method,
                    url: req.url,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString()
                });
            }
            next();
        };

        return { auditLogger };
    }

    // ===== Security Event Logging =====
    logSecurityEvent(event, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            data: data,
            severity: this.getEventSeverity(event)
        };
        
        this.auditLog.push(logEntry);
        
        // Keep only last 10000 entries
        if (this.auditLog.length > 10000) {
            this.auditLog.shift();
        }
        
        // Log to console for critical events
        if (logEntry.severity === 'HIGH') {
            console.warn('🚨 SECURITY ALERT:', event, data);
        } else if (logEntry.severity === 'MEDIUM') {
            console.log('⚠️  Security Event:', event, data);
        }
        
        // In production, you might want to send alerts to external monitoring
        if (logEntry.severity === 'HIGH') {
            this.sendSecurityAlert(logEntry);
        }
    }

    getEventSeverity(event) {
        const highSeverity = [
            'RATE_LIMIT_EXCEEDED',
            'LOGIN_RATE_LIMIT_EXCEEDED',
            'ADMIN_ACCESS_DENIED',
            'ADMIN_IP_BLOCKED',
            'INVALID_FILE_TYPE',
            'FILE_SIZE_EXCEEDED'
        ];
        
        const mediumSeverity = [
            'FAILED_LOGIN',
            'UNAUTHORIZED_ACCESS',
            'INVALID_EMAIL_FORMAT'
        ];
        
        if (highSeverity.includes(event)) return 'HIGH';
        if (mediumSeverity.includes(event)) return 'MEDIUM';
        return 'LOW';
    }

    sendSecurityAlert(logEntry) {
        // In production, send to monitoring service
        // For now, just log to console
        console.error('🚨 CRITICAL SECURITY EVENT:', logEntry);
    }

    // ===== Security Report =====
    generateSecurityReport() {
        const now = Date.now();
        const last24Hours = now - (24 * 60 * 60 * 1000);
        
        const recentEvents = this.auditLog.filter(entry => 
            new Date(entry.timestamp).getTime() > last24Hours
        );
        
        const eventCounts = {};
        recentEvents.forEach(entry => {
            eventCounts[entry.event] = (eventCounts[entry.event] || 0) + 1;
        });
        
        return {
            timestamp: new Date().toISOString(),
            period: '24 hours',
            totalEvents: recentEvents.length,
            eventBreakdown: eventCounts,
            suspiciousIPs: Array.from(this.suspiciousIPs),
            activeLoginAttempts: this.loginAttempts.size,
            activeSessions: this.activeSessions.size,
            highSeverityEvents: recentEvents.filter(e => e.severity === 'HIGH').length,
            mediumSeverityEvents: recentEvents.filter(e => e.severity === 'MEDIUM').length
        };
    }

    // ===== Cleanup =====
    cleanup() {
        // Clean old login attempts
        const now = Date.now();
        for (const [key, attempts] of this.loginAttempts.entries()) {
            if (now - attempts.lastAttempt > SECURITY_CONFIG.LOCKOUT_TIME * 2) {
                this.loginAttempts.delete(key);
            }
        }
        
        // Clean old audit logs (keep last 7 days)
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        this.auditLog = this.auditLog.filter(entry => 
            new Date(entry.timestamp).getTime() > weekAgo
        );
    }
}

// ===== Export Security Manager =====
module.exports = {
    ServerSecurityManager,
    SECURITY_CONFIG
};

// ===== Usage Example =====
/*
// In your server.js file:

const { ServerSecurityManager, SECURITY_CONFIG } = require('./server-security-middleware');

// Initialize security manager
const securityManager = new ServerSecurityManager();

// Apply security middleware
const { generalLimiter, loginLimiter, apiLimiter } = securityManager.createRateLimiters();
const { validateEmail, validatePassword, sanitizeInput } = securityManager.createInputValidators();
const { requireAuth, requireAdmin } = securityManager.createAuthMiddleware();
const { validateFileUpload } = securityManager.createFileUploadSecurity();
const { auditLogger } = securityManager.createAuditMiddleware();

// Apply to Express app
app.use(generalLimiter);
app.use(auditLogger);
securityManager.setupSecurityHeaders(app);

// Apply to specific routes
app.post('/api/login', loginLimiter, validateEmail, sanitizeInput, async (req, res) => {
    try {
        securityManager.checkLoginAttempts(req.body.email, req.ip);
        // ... existing login logic ...
        securityManager.recordSuccessfulLogin(req.body.email, req.ip);
    } catch (error) {
        securityManager.recordFailedLogin(req.body.email, req.ip);
        res.status(401).json({ error: error.message });
    }
});

app.post('/api/register', validateEmail, validatePassword, sanitizeInput, async (req, res) => {
    // ... existing registration logic ...
});

app.use('/api/admin', requireAdmin);
app.post('/api/admin/upload', validateFileUpload, (req, res) => {
    // ... file upload logic ...
});

// Security report endpoint
app.get('/api/admin/security-report', requireAdmin, (req, res) => {
    res.json(securityManager.generateSecurityReport());
});

// Cleanup interval
setInterval(() => {
    securityManager.cleanup();
}, 60 * 60 * 1000); // Every hour
*/