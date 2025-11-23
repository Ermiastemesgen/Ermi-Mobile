// Comprehensive About Us Text Fix Script
// Run this in browser console on Railway main page

console.log('🔧 COMPREHENSIVE ABOUT US TEXT FIX SCRIPT');
console.log('==========================================');

// Step 1: Check current environment
console.log('\n📍 STEP 1: Environment Check');
console.log('URL:', window.location.href);
console.log('Hostname:', window.location.hostname);
console.log('Origin:', window.location.origin);

// Determine API URL
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`;
console.log('API URL:', API_URL);

// Step 2: Check DOM elements
console.log('\n📍 STEP 2: DOM Elements Check');
const aboutSection = document.getElementById('about');
const aboutText = document.getElementById('aboutText');
console.log('About section found:', !!aboutSection);
console.log('About text element found:', !!aboutText);

if (aboutText) {
    console.log('Current text length:', aboutText.textContent.length);
    console.log('Current text preview:', aboutText.textContent.substring(0, 100) + '...');
} else {
    console.log('❌ aboutText element not found!');
    // Try alternative selectors
    const altElement = document.querySelector('.about-text');
    console.log('Alternative .about-text element found:', !!altElement);
}

// Step 3: Test API
console.log('\n📍 STEP 3: API Test');
async function testAPI() {
    try {
        console.log('Fetching from:', API_URL + '/settings');
        const response = await fetch(API_URL + '/settings');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            console.log('❌ API request failed');
            return null;
        }
        
        const data = await response.json();
        console.log('API response received');
        console.log('Settings count:', Object.keys(data.settings || {}).length);
        console.log('about_text exists:', !!data.settings?.about_text);
        
        if (data.settings?.about_text) {
            console.log('about_text length:', data.settings.about_text.length);
            console.log('about_text preview:', data.settings.about_text.substring(0, 100) + '...');
        }
        
        return data.settings;
    } catch (error) {
        console.error('❌ API Error:', error);
        return null;
    }
}

// Step 4: Force fix function
async function forceFix() {
    console.log('\n📍 STEP 4: Force Fix Attempt');
    
    const settings = await testAPI();
    if (!settings) {
        console.log('❌ Cannot fix - API not working');
        return false;
    }
    
    if (!settings.about_text) {
        console.log('❌ Cannot fix - no about_text in settings');
        console.log('Available settings:', Object.keys(settings));
        return false;
    }
    
    let element = document.getElementById('aboutText');
    if (!element) {
        element = document.querySelector('.about-text');
    }
    
    if (!element) {
        console.log('❌ Cannot fix - no element found');
        return false;
    }
    
    console.log('✅ Applying fix...');
    element.textContent = settings.about_text;
    console.log('✅ Text updated successfully!');
    
    // Scroll to about section
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
        console.log('✅ Scrolled to about section');
    }
    
    return true;
}

// Step 5: Check existing functions
console.log('\n📍 STEP 5: Function Availability Check');
console.log('loadSiteSettings function:', typeof window.loadSiteSettings);
console.log('forceUpdateAboutText function:', typeof window.forceUpdateAboutText);

// Step 6: Try existing functions
async function tryExistingFunctions() {
    console.log('\n📍 STEP 6: Testing Existing Functions');
    
    if (typeof window.loadSiteSettings === 'function') {
        console.log('🔧 Trying loadSiteSettings...');
        try {
            await window.loadSiteSettings();
            console.log('✅ loadSiteSettings completed');
        } catch (error) {
            console.error('❌ loadSiteSettings error:', error);
        }
    }
    
    if (typeof window.forceUpdateAboutText === 'function') {
        console.log('🔧 Trying forceUpdateAboutText...');
        try {
            const result = await window.forceUpdateAboutText();
            console.log('forceUpdateAboutText result:', result);
        } catch (error) {
            console.error('❌ forceUpdateAboutText error:', error);
        }
    }
}

// Step 7: Manual settings refresh
async function refreshSettings() {
    console.log('\n📍 STEP 7: Manual Settings Refresh');
    try {
        const response = await fetch(API_URL + '/settings/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Settings refresh response:', data);
            return true;
        } else {
            console.log('❌ Settings refresh failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Settings refresh error:', error);
        return false;
    }
}

// Main execution
async function runDiagnostic() {
    console.log('\n🚀 RUNNING COMPREHENSIVE DIAGNOSTIC...');
    
    // Test API first
    await testAPI();
    
    // Try existing functions
    await tryExistingFunctions();
    
    // Try manual refresh
    await refreshSettings();
    
    // Wait a bit for refresh to take effect
    setTimeout(async () => {
        console.log('\n🔧 ATTEMPTING FORCE FIX...');
        const success = await forceFix();
        
        if (success) {
            console.log('\n🎉 SUCCESS! About Us text should now be updated.');
            console.log('Check the About section on the page.');
        } else {
            console.log('\n❌ FAILED TO FIX');
            console.log('Please share this console output for further debugging.');
        }
    }, 2000);
}

// Run the diagnostic
runDiagnostic();