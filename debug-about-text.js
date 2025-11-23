// Debug script for About Us text issue
// Add this to browser console on the main page to debug

console.log('🔍 About Us Text Debug Script');

// Check if element exists
const aboutElement = document.getElementById('aboutText');
console.log('📍 aboutText element:', aboutElement);

if (aboutElement) {
    console.log('📝 Current text:', aboutElement.textContent);
    console.log('📏 Text length:', aboutElement.textContent.length);
} else {
    console.log('❌ aboutText element not found!');
    console.log('🔍 Available elements with "about" in ID:');
    const allElements = document.querySelectorAll('[id*="about"], [class*="about"]');
    allElements.forEach(el => {
        console.log('  -', el.tagName, el.id, el.className);
    });
}

// Test API directly
async function testAPI() {
    console.log('🌐 Testing API...');
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        console.log('✅ API Response:', data);
        console.log('📝 About text in API:', data.settings?.about_text || 'NOT FOUND');
        
        if (data.settings?.about_text && aboutElement) {
            console.log('🔧 Manually updating element...');
            aboutElement.textContent = data.settings.about_text;
            console.log('✅ Manual update complete!');
        }
    } catch (error) {
        console.error('❌ API Error:', error);
    }
}

// Test loadSiteSettings function
if (typeof loadSiteSettings === 'function') {
    console.log('🔧 Testing loadSiteSettings function...');
    loadSiteSettings().then(() => {
        console.log('✅ loadSiteSettings completed');
    }).catch(error => {
        console.error('❌ loadSiteSettings error:', error);
    });
} else {
    console.log('❌ loadSiteSettings function not found');
}

// Run API test
testAPI();

// Check if forceUpdateAboutText is available
if (typeof forceUpdateAboutText === 'function') {
    console.log('🔧 Testing forceUpdateAboutText...');
    forceUpdateAboutText();
} else {
    console.log('❌ forceUpdateAboutText function not found');
}

console.log('🎯 Debug complete. Check the logs above for issues.');