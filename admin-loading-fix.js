// Fix for Railway admin panel loading issues
console.log('🔧 Admin Panel Loading Fix Script');

// Override the API URL to ensure it's correct
const API_URL = window.location.origin + '/api';
console.log('📍 API URL:', API_URL);

// Add loading timeout and error handling
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    console.log('🌐 Fetching:', url);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
    });
    
    const fetchPromise = originalFetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    return Promise.race([fetchPromise, timeoutPromise])
        .then(response => {
            console.log('✅ Response:', response.status, response.statusText);
            return response;
        })
        .catch(error => {
            console.error('❌ Fetch error:', error);
            throw error;
        });
};

// Add global error handler for admin panel
window.addEventListener('error', function(e) {
    console.error('❌ Global error:', e.error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fee2e2;
        color: #991b1b;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #fecaca;
        z-index: 10000;
        max-width: 400px;
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ Loading Error</strong><br>
        ${e.error.message}<br>
        <small>Check console for details</small>
    `;
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
});

// Add loading indicator
function showLoadingIndicator() {
    const loading = document.createElement('div');
    loading.id = 'globalLoading';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-size: 18px;
        color: #2563eb;
    `;
    loading.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <div>Loading Admin Panel...</div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loading);
    
    // Remove loading after 10 seconds max
    setTimeout(() => {
        const loadingEl = document.getElementById('globalLoading');
        if (loadingEl) {
            loadingEl.remove();
        }
    }, 10000);
}

function hideLoadingIndicator() {
    const loading = document.getElementById('globalLoading');
    if (loading) {
        loading.remove();
    }
}

// Test API connectivity on load
async function testAPIConnectivity() {
    console.log('🧪 Testing API connectivity...');
    
    try {
        // Test basic endpoints
        const endpoints = [
            '/products',
            '/settings',
            '/categories'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(API_URL + endpoint);
                console.log(`✅ ${endpoint}: ${response.status}`);
            } catch (error) {
                console.error(`❌ ${endpoint}: ${error.message}`);
            }
        }
        
        console.log('🎉 API connectivity test complete');
        hideLoadingIndicator();
        
    } catch (error) {
        console.error('❌ API connectivity test failed:', error);
        hideLoadingIndicator();
        
        // Show error message to user
        alert('⚠️ Admin panel loading failed. Please check your internet connection and try refreshing the page.');
    }
}

// Enhanced DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing admin panel...');
    
    showLoadingIndicator();
    
    // Test API connectivity first
    testAPIConnectivity();
    
    // Add retry mechanism for failed loads
    setTimeout(() => {
        if (document.getElementById('globalLoading')) {
            console.log('⚠️ Admin panel still loading, retrying...');
            testAPIConnectivity();
        }
    }, 5000);
});

// Add manual retry function
window.retryAdminLoad = function() {
    console.log('🔄 Manual retry triggered');
    showLoadingIndicator();
    testAPIConnectivity();
};

console.log('✅ Admin loading fix script loaded');