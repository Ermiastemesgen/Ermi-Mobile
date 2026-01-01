// ===== COMPREHENSIVE SECURITY ENHANCEMENTS =====
// This file contains advanced security features for both main website and admin panel

// ===== Security Configuration =====
const SECURITY_CONFIG = {
    // Rate limiting
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
    MAX_API_REQUESTS_PER_MINUTE: 60,
    
    // Session management
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    IDLE_WARNING_TIME: 25 * 60 * 1000, // 25 minutes
    
    // Password requirements
    MIN_PASSWORD_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    
    // Security headers
    ENABLE_CSP: true,
    ENABLE_HSTS: true,
    ENABLE_XSS_PROTECTION: true,
    
    // Admin security
    ADMIN_2FA_REQUIRED: false, // Can be enabled later
    ADMIN_IP_WHITELIST: [], // Empty means all IPs allowed
    
    // Audit logging
    LOG_ALL_ACTIONS: true,
    LOG_FAILED_ATTEMPTS: true,
    LOG_ADMIN_ACTIONS: true
};

// ===== Security State Management =====
class SecurityManager {
    constructor() {
        this.loginAttempts = new Map();
        this.apiRequests = new Map();
        this.activeSessions = new Map();
        this.auditLog = [];
        this.init();
    }

    init() {
        this.setupCSRFProtection();
        this.setupSessionManagement();
        this.setupInputSanitization();
        this.setupRateLimiting();
        this.setupSecurityHeaders();
        this.setupAuditLogging();
        console.log('🔒 Security Manager initialized');
    }

    // ===== CSRF Protection =====
    setupCSRFProtection() {
        // Generate CSRF token
        this.csrfToken = this.generateSecureToken();
        
        // Add CSRF token to all forms
        document.addEventListener('DOMContentLoaded', () => {
            this.addCSRFTokenToForms();
        });

        // Validate CSRF token on form submissions
        this.interceptFormSubmissions();
    }

    generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    addCSRFTokenToForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.querySelector('input[name="csrf_token"]')) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                csrfInput.value = this.csrfToken;
                form.appendChild(csrfInput);
            }
        });
    }

    interceptFormSubmissions() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const csrfInput = form.querySelector('input[name="csrf_token"]');
            
            if (!csrfInput || csrfInput.value !== this.csrfToken) {
                e.preventDefault();
                this.logSecurityEvent('CSRF_TOKEN_INVALID', { form: form.id || 'unknown' });
                this.showSecurityAlert('Security validation failed. Please refresh the page.');
                return false;
            }
        });
    }

    // ===== Session Management =====
    setupSessionManagement() {
        this.sessionStartTime = Date.now();
        this.lastActivity = Date.now();
        
        // Track user activity
        this.trackUserActivity();
        
        // Check session timeout
        setInterval(() => {
            this.checkSessionTimeout();
        }, 60000); // Check every minute

        // Warn about idle session
        setTimeout(() => {
            this.showIdleWarning();
        }, SECURITY_CONFIG.IDLE_WARNING_TIME);
    }

    trackUserActivity() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            }, { passive: true });
        });
    }

    checkSessionTimeout() {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivity;
        
        if (timeSinceLastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
            this.logSecurityEvent('SESSION_TIMEOUT', { 
                duration: timeSinceLastActivity,
                user: this.getCurrentUser()
            });
            this.forceLogout('Session expired due to inactivity');
        }
    }

    showIdleWarning() {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivity;
        
        if (timeSinceLastActivity > SECURITY_CONFIG.IDLE_WARNING_TIME) {
            const remainingTime = Math.ceil((SECURITY_CONFIG.SESSION_TIMEOUT - timeSinceLastActivity) / 60000);
            
            if (remainingTime > 0) {
                const extend = confirm(`Your session will expire in ${remainingTime} minutes due to inactivity. Do you want to extend your session?`);
                
                if (extend) {
                    this.lastActivity = Date.now();
                    // Reset idle warning
                    setTimeout(() => {
                        this.showIdleWarning();
                    }, SECURITY_CONFIG.IDLE_WARNING_TIME);
                }
            }
        } else {
            // Reset idle warning if user became active
            setTimeout(() => {
                this.showIdleWarning();
            }, SECURITY_CONFIG.IDLE_WARNING_TIME - timeSinceLastActivity);
        }
    }

    // ===== Input Sanitization =====
    setupInputSanitization() {
        // Sanitize all form inputs
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.sanitizeInput(e.target);
            }
        });
    }

    sanitizeInput(input) {
        const originalValue = input.value;
        let sanitizedValue = originalValue;

        // Remove potentially dangerous characters
        sanitizedValue = sanitizedValue.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitizedValue = sanitizedValue.replace(/javascript:/gi, '');
        sanitizedValue = sanitizedValue.replace(/on\w+\s*=/gi, '');
        
        // Log if sanitization occurred
        if (originalValue !== sanitizedValue) {
            this.logSecurityEvent('INPUT_SANITIZED', {
                field: input.name || input.id,
                original: originalValue,
                sanitized: sanitizedValue
            });
            input.value = sanitizedValue;
        }
    }

    // ===== Rate Limiting =====
    setupRateLimiting() {
        this.interceptAPIRequests();
    }

    interceptAPIRequests() {
        // Override fetch to add rate limiting
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            if (url.includes('/api/')) {
                if (!this.checkRateLimit()) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
            }
            
            return originalFetch(url, options);
        };
    }

    checkRateLimit() {
        const now = Date.now();
        const minute = Math.floor(now / 60000);
        const key = `${this.getClientIP()}_${minute}`;
        
        const requests = this.apiRequests.get(key) || 0;
        
        if (requests >= SECURITY_CONFIG.MAX_API_REQUESTS_PER_MINUTE) {
            this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                ip: this.getClientIP(),
                requests: requests,
                limit: SECURITY_CONFIG.MAX_API_REQUESTS_PER_MINUTE
            });
            return false;
        }
        
        this.apiRequests.set(key, requests + 1);
        
        // Clean old entries
        setTimeout(() => {
            this.apiRequests.delete(key);
        }, 60000);
        
        return true;
    }

    // ===== Login Security =====
    checkLoginAttempts(email) {
        const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
        const now = Date.now();
        
        // Reset attempts if lockout time has passed
        if (now - attempts.lastAttempt > SECURITY_CONFIG.LOGIN_LOCKOUT_TIME) {
            attempts.count = 0;
        }
        
        if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
            const remainingTime = Math.ceil((SECURITY_CONFIG.LOGIN_LOCKOUT_TIME - (now - attempts.lastAttempt)) / 60000);
            throw new Error(`Too many failed login attempts. Please try again in ${remainingTime} minutes.`);
        }
        
        return true;
    }

    recordFailedLogin(email) {
        const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = Date.now();
        this.loginAttempts.set(email, attempts);
        
        this.logSecurityEvent('FAILED_LOGIN', {
            email: email,
            attempts: attempts.count,
            ip: this.getClientIP()
        });
    }

    recordSuccessfulLogin(email) {
        this.loginAttempts.delete(email);
        this.logSecurityEvent('SUCCESSFUL_LOGIN', {
            email: email,
            ip: this.getClientIP()
        });
    }

    // ===== Password Validation =====
    validatePassword(password) {
        const errors = [];
        
        if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
            errors.push(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
        }
        
        if (SECURITY_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (SECURITY_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (SECURITY_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (SECURITY_CONFIG.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
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

    // ===== Security Headers =====
    setupSecurityHeaders() {
        // This would typically be done server-side, but we can add some client-side checks
        this.checkSecurityHeaders();
    }

    checkSecurityHeaders() {
        // Check if security headers are present (for debugging)
        fetch(window.location.href, { method: 'HEAD' })
            .then(response => {
                const headers = response.headers;
                const securityHeaders = {
                    'X-Content-Type-Options': headers.get('X-Content-Type-Options'),
                    'X-Frame-Options': headers.get('X-Frame-Options'),
                    'X-XSS-Protection': headers.get('X-XSS-Protection'),
                    'Strict-Transport-Security': headers.get('Strict-Transport-Security'),
                    'Content-Security-Policy': headers.get('Content-Security-Policy')
                };
                
                this.logSecurityEvent('SECURITY_HEADERS_CHECK', securityHeaders);
            })
            .catch(error => {
                console.warn('Could not check security headers:', error);
            });
    }

    // ===== Audit Logging =====
    setupAuditLogging() {
        // Log page loads
        this.logSecurityEvent('PAGE_LOAD', {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        
        // Log page unloads
        window.addEventListener('beforeunload', () => {
            this.logSecurityEvent('PAGE_UNLOAD', {
                url: window.location.href,
                sessionDuration: Date.now() - this.sessionStartTime
            });
        });
    }

    logSecurityEvent(event, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            data: data,
            user: this.getCurrentUser(),
            ip: this.getClientIP(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.auditLog.push(logEntry);
        
        // Keep only last 1000 entries
        if (this.auditLog.length > 1000) {
            this.auditLog.shift();
        }
        
        // Send critical events to server
        if (this.isCriticalEvent(event)) {
            this.sendSecurityAlert(logEntry);
        }
        
        console.log('🔒 Security Event:', event, data);
    }

    isCriticalEvent(event) {
        const criticalEvents = [
            'FAILED_LOGIN',
            'RATE_LIMIT_EXCEEDED',
            'CSRF_TOKEN_INVALID',
            'INPUT_SANITIZED',
            'ADMIN_ACCESS_DENIED',
            'SUSPICIOUS_ACTIVITY'
        ];
        
        return criticalEvents.includes(event);
    }

    sendSecurityAlert(logEntry) {
        // Send security alert to server (if endpoint exists)
        fetch('/api/security/alert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logEntry)
        }).catch(error => {
            console.warn('Could not send security alert:', error);
        });
    }

    // ===== Admin Security =====
    checkAdminAccess() {
        const user = this.getCurrentUser();
        
        if (!user || user.role !== 'admin') {
            this.logSecurityEvent('ADMIN_ACCESS_DENIED', {
                user: user,
                attemptedUrl: window.location.href
            });
            
            this.showSecurityAlert('Access denied. Admin privileges required.');
            window.location.href = '/';
            return false;
        }
        
        // Check IP whitelist if configured
        if (SECURITY_CONFIG.ADMIN_IP_WHITELIST.length > 0) {
            const clientIP = this.getClientIP();
            if (!SECURITY_CONFIG.ADMIN_IP_WHITELIST.includes(clientIP)) {
                this.logSecurityEvent('ADMIN_IP_BLOCKED', {
                    ip: clientIP,
                    user: user
                });
                
                this.showSecurityAlert('Access denied from this IP address.');
                window.location.href = '/';
                return false;
            }
        }
        
        this.logSecurityEvent('ADMIN_ACCESS_GRANTED', {
            user: user,
            url: window.location.href
        });
        
        return true;
    }

    // ===== Utility Functions =====
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser')) || null;
        } catch {
            return null;
        }
    }

    getClientIP() {
        // This is a simplified version - in production, you'd get this from server
        return 'client-ip-unknown';
    }

    showSecurityAlert(message) {
        alert('🔒 Security Alert: ' + message);
    }

    forceLogout(reason) {
        this.logSecurityEvent('FORCED_LOGOUT', { reason: reason });
        
        // Clear user session
        localStorage.removeItem('currentUser');
        
        // Redirect to login
        this.showSecurityAlert(reason);
        window.location.href = '/';
    }

    // ===== Public API =====
    getAuditLog() {
        return this.auditLog;
    }

    clearAuditLog() {
        this.auditLog = [];
        this.logSecurityEvent('AUDIT_LOG_CLEARED');
    }

    exportSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            sessionDuration: Date.now() - this.sessionStartTime,
            totalEvents: this.auditLog.length,
            criticalEvents: this.auditLog.filter(entry => this.isCriticalEvent(entry.event)).length,
            auditLog: this.auditLog,
            config: SECURITY_CONFIG
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// ===== Enhanced Login Security =====
class SecureLogin {
    constructor(securityManager) {
        this.securityManager = securityManager;
        this.setupSecureLogin();
    }

    setupSecureLogin() {
        // Override existing login function
        if (typeof handleLogin === 'function') {
            const originalHandleLogin = handleLogin;
            window.handleLogin = async (e) => {
                return this.secureHandleLogin(e, originalHandleLogin);
            };
        }
    }

    async secureHandleLogin(e, originalHandler) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            // Check rate limiting
            this.securityManager.checkLoginAttempts(email);
            
            // Validate input
            if (!this.validateLoginInput(email, password)) {
                return;
            }
            
            // Call original login handler
            const result = await originalHandler(e);
            
            // Record successful login
            this.securityManager.recordSuccessfulLogin(email);
            
            return result;
            
        } catch (error) {
            // Record failed login
            this.securityManager.recordFailedLogin(email);
            
            // Show error
            if (typeof showNotification === 'function') {
                showNotification(error.message, 'error');
            } else {
                alert(error.message);
            }
        }
    }

    validateLoginInput(email, password) {
        // Basic validation
        if (!email || !password) {
            if (typeof showNotification === 'function') {
                showNotification('Please fill in all fields', 'error');
            }
            return false;
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (typeof showNotification === 'function') {
                showNotification('Please enter a valid email address', 'error');
            }
            return false;
        }
        
        return true;
    }
}

// ===== Enhanced Registration Security =====
class SecureRegistration {
    constructor(securityManager) {
        this.securityManager = securityManager;
        this.setupSecureRegistration();
    }

    setupSecureRegistration() {
        // Add password strength indicator
        this.addPasswordStrengthIndicator();
        
        // Override registration validation
        this.enhanceRegistrationValidation();
    }

    addPasswordStrengthIndicator() {
        const passwordInput = document.getElementById('signupPassword');
        if (!passwordInput) return;
        
        const strengthIndicator = document.createElement('div');
        strengthIndicator.id = 'passwordStrength';
        strengthIndicator.style.cssText = `
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 600;
        `;
        
        passwordInput.parentNode.insertBefore(strengthIndicator, passwordInput.nextSibling);
        
        passwordInput.addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value, strengthIndicator);
        });
    }

    updatePasswordStrength(password, indicator) {
        const validation = this.securityManager.validatePassword(password);
        
        if (password.length === 0) {
            indicator.style.display = 'none';
            return;
        }
        
        indicator.style.display = 'block';
        
        if (validation.isValid) {
            indicator.textContent = '✅ Strong password';
            indicator.style.background = '#d1fae5';
            indicator.style.color = '#065f46';
        } else {
            indicator.innerHTML = '❌ ' + validation.errors.join('<br>❌ ');
            indicator.style.background = '#fee2e2';
            indicator.style.color = '#991b1b';
        }
    }

    enhanceRegistrationValidation() {
        const signupForm = document.getElementById('signupForm');
        if (!signupForm) return;
        
        signupForm.addEventListener('submit', (e) => {
            const password = document.getElementById('signupPassword').value;
            const validation = this.securityManager.validatePassword(password);
            
            if (!validation.isValid) {
                e.preventDefault();
                if (typeof showNotification === 'function') {
                    showNotification('Password does not meet security requirements', 'error');
                } else {
                    alert('Password does not meet security requirements:\n' + validation.errors.join('\n'));
                }
            }
        });
    }
}

// ===== Initialize Security System =====
let securityManager;
let secureLogin;
let secureRegistration;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize security manager
    securityManager = new SecurityManager();
    
    // Initialize secure login
    secureLogin = new SecureLogin(securityManager);
    
    // Initialize secure registration
    secureRegistration = new SecureRegistration(securityManager);
    
    // Check if on admin page
    if (window.location.pathname.includes('admin')) {
        securityManager.checkAdminAccess();
    }
    
    console.log('🔒 Security system initialized');
});

// ===== Global Security Functions =====
window.SecurityManager = SecurityManager;
window.getSecurityManager = () => securityManager;
window.exportSecurityReport = () => securityManager?.exportSecurityReport();
window.getAuditLog = () => securityManager?.getAuditLog();

// ===== Security Monitoring =====
setInterval(() => {
    if (securityManager) {
        // Check for suspicious activity
        const recentEvents = securityManager.auditLog.slice(-10);
        const suspiciousPatterns = [
            'RATE_LIMIT_EXCEEDED',
            'CSRF_TOKEN_INVALID',
            'ADMIN_ACCESS_DENIED'
        ];
        
        const suspiciousCount = recentEvents.filter(event => 
            suspiciousPatterns.includes(event.event)
        ).length;
        
        if (suspiciousCount >= 3) {
            securityManager.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
                recentEvents: recentEvents,
                suspiciousCount: suspiciousCount
            });
        }
    }
}, 60000); // Check every minute