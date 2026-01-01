
// ===== MINIMAL CLEAN SCRIPT =====
const API_URL = window.location.origin + '/api';
console.log('🔗 API_URL:', API_URL);

let products = [];
let allProducts = [];

async function fetchProducts() {
    console.log('🚀 fetchProducts started');
    
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 2rem;">Loading...</div>';
    
    try {
        const response = await fetch(API_URL + '/products');
        const data = await response.json();
        
        if (data && data.products) {
            products = data.products;
            allProducts = data.products;
            displayProducts();
        }
    } catch (error) {
        console.error('Error:', error);
        productsGrid.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
                <h3>Error loading products</h3>
                <button onclick="window.location.reload()">Reload Page</button>
            </div>
        `;
    }
}

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid || !products) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <div style="width: 100%; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                    📦 ${product.name}
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.price} Birr</p>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(fetchProducts, 100);
});
