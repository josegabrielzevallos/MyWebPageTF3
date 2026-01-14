/**
 * Retail Dashboard - Main Shopping Application
 * Handles products, cart, and checkout functionality
 */

const API_URL = 'http://localhost:3000/api';
let products = [];
let cart = [];
let currentProduct = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    loadProducts();
    setupEventListeners();
    updateCartWidget();
    setupHamburgerMenu();
});

// ==================== HAMBURGER MENU ====================
function setupHamburgerMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    if (!hamburgerBtn || !navMenu) return;

    hamburgerBtn.addEventListener('click', () => {
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('nav-open');
        hamburgerBtn.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('nav-open');
            hamburgerBtn.classList.remove('active');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('nav-open');
            hamburgerBtn.classList.remove('active');
        }
    });
}

// ==================== PRODUCTS ====================
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to load products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        // Use mock data as fallback
        useMockProducts();
    }
}

function useMockProducts() {
    products = [
        {
            id: 1,
            name: 'Vitamin C 1000mg',
            price: 12.99,
            category: 'vitamins',
            stock: 50,
            image: './images/vitamin-c.png',
            description: 'High-potency Vitamin C supplement for immune support',
            reviews: [
                { rating: 5, comment: 'Great product, very effective!' },
                { rating: 4, comment: 'Good quality, would recommend' }
            ],
            sales: 120
        },
        {
            id: 2,
            name: 'Omega-3 Fish Oil',
            price: 15.99,
            category: 'supplements',
            stock: 35,
            image: 'https://via.placeholder.com/250x250?text=Omega3',
            description: 'Premium fish oil rich in EPA and DHA',
            reviews: [
                { rating: 5, comment: 'Excellent for heart health' },
                { rating: 5, comment: 'Great supplement, no fishy aftertaste' }
            ],
            sales: 95
        },
        {
            id: 3,
            name: 'Magnesium 400mg',
            price: 10.99,
            category: 'minerals',
            stock: 60,
            image: 'https://via.placeholder.com/250x250?text=Magnesium',
            description: 'Supports muscle and bone health',
            reviews: [
                { rating: 4, comment: 'Good quality' },
                { rating: 4, comment: 'Helps with sleep' }
            ],
            sales: 80
        },
        {
            id: 4,
            name: 'Whey Protein Powder',
            price: 29.99,
            category: 'protein',
            stock: 25,
            image: 'https://via.placeholder.com/250x250?text=Protein',
            description: 'High-quality whey protein for muscle building',
            reviews: [
                { rating: 5, comment: 'Amazing taste!' },
                { rating: 5, comment: 'Perfect for post-workout' }
            ],
            sales: 150
        },
        {
            id: 5,
            name: 'Multivitamin Daily',
            price: 14.99,
            category: 'vitamins',
            stock: 45,
            image: 'https://via.placeholder.com/250x250?text=Multivitamin',
            description: 'Complete daily multivitamin formula',
            reviews: [
                { rating: 4, comment: 'Good all-rounder' },
                { rating: 3, comment: 'Decent product' }
            ],
            sales: 110
        },
        {
            id: 6,
            name: 'Zinc 30mg',
            price: 9.99,
            category: 'minerals',
            stock: 70,
            image: 'https://via.placeholder.com/250x250?text=Zinc',
            description: 'Supports immune system function',
            reviews: [
                { rating: 5, comment: 'Great for immunity!' },
                { rating: 4, comment: 'Excellent value' }
            ],
            sales: 100
        }
    ];
    displayProducts(products);
}

function displayProducts(productsToShow) {
    const gallery = document.getElementById('products-gallery');
    if (!gallery) return;

    gallery.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <div class="stock-indicator ${product.stock > 20 ? 'in-stock' : 'low-stock'}">
                    ${product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                </div>
                <button class="btn btn-primary view-details-btn" data-product-id="${product.id}">
                    View Details
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.productId);
            openProductModal(productId);
        });
    });
}

function openProductModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    const modal = document.getElementById('product-modal');
    if (!modal) return;

    document.getElementById('modal-image').src = currentProduct.image;
    document.getElementById('modal-name').textContent = currentProduct.name;
    document.getElementById('modal-price').textContent = `$${currentProduct.price.toFixed(2)}`;
    document.getElementById('modal-description').textContent = currentProduct.description;
    
    const stockStatus = document.getElementById('modal-stock');
    if (stockStatus) {
        stockStatus.textContent = currentProduct.stock > 0 
            ? `In Stock (${currentProduct.stock} available)` 
            : 'Out of Stock';
        stockStatus.className = `stock-status ${currentProduct.stock > 0 ? 'in-stock' : 'out-of-stock'}`;
    }

    displayReviews(currentProduct.reviews);
    document.getElementById('quantity-input').value = 1;

    modal.style.display = 'block';
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet.</p>';
        return;
    }

    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

    reviewsList.innerHTML = `
        <div class="average-rating">⭐ ${avgRating}/5 (${reviews.length} reviews)</div>
        ${reviews.map(review => `
            <div class="review-item">
                <p class="review-rating">${'⭐'.repeat(review.rating)}</p>
                <p class="review-comment">${review.comment}</p>
            </div>
        `).join('')}
    `;
}

// ==================== CART ====================
function addToCart() {
    if (!currentProduct) return;

    const quantity = parseInt(document.getElementById('quantity-input').value) || 1;

    if (currentProduct.stock < quantity) {
        showError('Not enough stock available');
        return;
    }

    const existingItem = cart.find(item => item.id === currentProduct.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: quantity,
            image: currentProduct.image
        });
    }

    saveCartToStorage();
    updateCartWidget();
    showSuccess('Product added to cart!');
    
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'none';
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartWidget();
    displayCartItems();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCartToStorage();
        updateCartWidget();
        displayCartItems();
    }
}

function updateCartWidget() {
    const cartCount = document.querySelector('.cart-count');
    const cartPreview = document.getElementById('cart-preview');
    const viewCartBtn = document.getElementById('view-cart-btn');

    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    if (cartPreview) {
        if (cart.length === 0) {
            cartPreview.innerHTML = '<p class="empty-cart">Cart is empty</p>';
            if (viewCartBtn) viewCartBtn.style.display = 'none';
        } else {
            const preview = cart.slice(0, 2).map(item => 
                `<p>${item.name} x${item.quantity}</p>`
            ).join('');
            cartPreview.innerHTML = preview;
            if (viewCartBtn) viewCartBtn.style.display = 'block';
        }
    }
}

function displayCartItems() {
    const cartItemsList = document.getElementById('cart-items-list');
    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }

    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" class="qty-btn">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.id}, this.value)">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" class="qty-btn">+</button>
            </div>
            <p class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</p>
            <button onclick="removeFromCart(${item.id})" class="btn btn-danger">Remove</button>
        </div>
    `).join('');

    updateCartTotals();
}

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    const elements = {
        'summary-subtotal': `$${subtotal.toFixed(2)}`,
        'summary-tax': `$${tax.toFixed(2)}`,
        'summary-total': `$${total.toFixed(2)}`
    };

    Object.entries(elements).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });
}

function saveCartToStorage() {
    localStorage.setItem('retail_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('retail_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

// ==================== MODALS & UI ====================
function setupEventListeners() {
    // Product modal
    setupModalClosing('product-modal');
    setupModalClosing('cart-modal');
    setupModalClosing('checkout-modal');

    // Add to cart button
    const addBtn = document.getElementById('add-to-cart-btn');
    if (addBtn) addBtn.addEventListener('click', addToCart);

    // View cart button
    const viewCartBtn = document.getElementById('view-cart-btn');
    if (viewCartBtn) viewCartBtn.addEventListener('click', openCartModal);

    // Cart button in nav
    const cartNavBtn = document.querySelector('[data-page="cart"]');
    if (cartNavBtn) cartNavBtn.addEventListener('click', openCartModal);

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);

    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) checkoutForm.addEventListener('submit', submitCheckout);

    // Submit review button
    const reviewBtn = document.getElementById('submit-review-btn');
    if (reviewBtn) reviewBtn.addEventListener('click', submitReview);

    // Search and filter
    const searchInput = document.getElementById('search-products');
    if (searchInput) searchInput.addEventListener('input', filterProducts);

    const categoryFilter = document.getElementById('filter-category');
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
}

function setupModalClosing(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function openCartModal() {
    displayCartItems();
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'block';
}

function openCheckoutModal() {
    if (cart.length === 0) {
        showError('Cart is empty. Add items first!');
        return;
    }

    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = 'block';
}

async function submitCheckout(e) {
    e.preventDefault();

    const checkoutData = {
        customer: {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            address: document.getElementById('customer-address').value,
            city: document.getElementById('customer-city').value,
            zip: document.getElementById('customer-zip').value,
            card: document.getElementById('customer-card').value
        },
        items: cart,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutData)
        });

        if (!response.ok) throw new Error('Checkout failed');

        cart = [];
        saveCartToStorage();
        updateCartWidget();

        showSuccess('Purchase completed successfully!');
        document.getElementById('checkout-modal').style.display = 'none';
        document.getElementById('checkout-form').reset();
    } catch (error) {
        showError('Checkout failed: ' + error.message);
    }
}

async function submitReview(e) {
    e.preventDefault();

    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;

    if (!rating || !comment) {
        showError('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: currentProduct.id,
                rating: parseInt(rating),
                comment: comment
            })
        });

        if (!response.ok) throw new Error('Review submission failed');

        // Add to local product
        currentProduct.reviews.push({
            rating: parseInt(rating),
            comment: comment
        });

        displayReviews(currentProduct.reviews);
        document.getElementById('review-rating').value = '';
        document.getElementById('review-comment').value = '';

        showSuccess('Review submitted!');
    } catch (error) {
        showError('Failed to submit review');
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('search-products')?.value.toLowerCase() || '';
    const category = document.getElementById('filter-category')?.value || '';

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                             p.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || p.category === category;
        return matchesSearch && matchesCategory;
    });

    displayProducts(filtered);
}

// ==================== UTILITIES ====================
function showSuccess(message) {
    alert(message); // In production, use a toast notification
}

function showError(message) {
    alert('Error: ' + message);
}