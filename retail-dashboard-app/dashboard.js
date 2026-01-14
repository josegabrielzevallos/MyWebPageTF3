/**
 * Dashboard - Sales Analytics and Visualization
 * Uses Chart.js to display product data, reviews, and sentiment analysis
 */

const API_URL = 'http://localhost:3000/api';
let dashboardData = null;
let charts = {};

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupEventListeners();
});

function setupEventListeners() {
    const refreshBtn = document.getElementById('refresh-dashboard-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadDashboardData);

    const restockBtn = document.getElementById('restock-btn');
    if (restockBtn) restockBtn.addEventListener('click', restockProducts);

    const exportBtn = document.getElementById('export-report-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportReport);
}

async function loadDashboardData() {
    try {
        const response = await fetch(`${API_URL}/dashboard-data`);
        if (!response.ok) throw new Error('Failed to load dashboard data');
        dashboardData = await response.json();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        useMockDashboardData();
    }

    updateDashboard();
}

function useMockDashboardData() {
    dashboardData = {
        products: [
            { id: 1, name: 'Vitamin C', stock: 50, category: 'vitamins', price: 12.99, sales: 120, avgRating: 4.5 },
            { id: 2, name: 'Omega-3', stock: 35, category: 'supplements', price: 15.99, sales: 95, avgRating: 4.8 },
            { id: 3, name: 'Magnesium', stock: 60, category: 'minerals', price: 10.99, sales: 80, avgRating: 4.0 },
            { id: 4, name: 'Whey Protein', stock: 25, category: 'protein', price: 29.99, sales: 150, avgRating: 4.7 },
            { id: 5, name: 'Multivitamin', stock: 45, category: 'vitamins', price: 14.99, sales: 110, avgRating: 3.8 },
            { id: 6, name: 'Zinc', stock: 70, category: 'minerals', price: 9.99, sales: 100, avgRating: 4.2 }
        ],
        reviews: [
            { productId: 1, rating: 5, comment: 'Great product, very effective!' },
            { productId: 2, rating: 5, comment: 'Excellent for heart health' },
            { productId: 4, rating: 5, comment: 'Amazing taste!' },
            { productId: 1, rating: 4, comment: 'Good quality, would recommend' },
            { productId: 2, rating: 5, comment: 'Great supplement, no fishy aftertaste' }
        ]
    };
}

function updateDashboard() {
    if (!dashboardData) return;

    updateStatistics();
    updateCharts();
    updateRecentReviews();
}

function updateStatistics() {
    const products = dashboardData.products;
    
    // Total Products
    const totalProducts = document.getElementById('stat-total-products');
    if (totalProducts) totalProducts.textContent = products.length;

    // Total Sales
    const totalSales = document.getElementById('stat-total-sales');
    if (totalSales) {
        const sales = products.reduce((sum, p) => sum + p.sales, 0);
        totalSales.textContent = sales;
    }

    // Average Rating
    const avgRating = document.getElementById('stat-avg-rating');
    if (avgRating) {
        const avg = (products.reduce((sum, p) => sum + p.avgRating, 0) / products.length).toFixed(1);
        avgRating.textContent = `${avg}/5`;
    }

    // Low Stock Items
    const lowStock = document.getElementById('stat-low-stock');
    if (lowStock) {
        const count = products.filter(p => p.stock < 30).length;
        lowStock.textContent = count;
    }
}

function updateCharts() {
    const products = dashboardData.products;

    // Inventory Chart
    updateInventoryChart(products);

    // Sales Chart
    updateSalesChart(products);

    // Reviews Chart
    updateReviewsChart(products);

    // Sentiment Chart
    updateSentimentChart(dashboardData.reviews);

    // Price Chart
    updatePriceChart(products);

    // Category Chart
    updateCategoryChart(products);
}

function updateInventoryChart(products) {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return;

    if (charts.inventory) charts.inventory.destroy();

    charts.inventory = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: products.map(p => p.name),
            datasets: [{
                label: 'Stock Quantity',
                data: products.map(p => p.stock),
                backgroundColor: products.map(p => p.stock < 30 ? 'rgba(255, 99, 132, 0.6)' : 'rgba(75, 192, 75, 0.6)'),
                borderColor: products.map(p => p.stock < 30 ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 75, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function updateSalesChart(products) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    if (charts.sales) charts.sales.destroy();

    charts.sales = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: products.map(p => p.name),
            datasets: [{
                data: products.map(p => p.sales),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 75, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function updateReviewsChart(products) {
    const ctx = document.getElementById('reviewsChart');
    if (!ctx) return;

    if (charts.reviews) charts.reviews.destroy();

    charts.reviews = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: products.map(p => p.name),
            datasets: [{
                label: 'Average Rating',
                data: products.map(p => p.avgRating),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    max: 5,
                    min: 0,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function updateSentimentChart(reviews) {
    const ctx = document.getElementById('sentimentChart');
    if (!ctx) return;

    if (charts.sentiment) charts.sentiment.destroy();

    // Sentiment analysis keywords
    const positiveKeywords = ['great', 'excellent', 'good', 'amazing', 'perfect', 'wonderful'];
    const negativeKeywords = ['bad', 'poor', 'disappointing', 'broken', 'terrible', 'awful'];

    let positive = 0, negative = 0, neutral = 0;

    reviews.forEach(review => {
        const commentLower = review.comment.toLowerCase();
        const hasPositive = positiveKeywords.some(keyword => commentLower.includes(keyword));
        const hasNegative = negativeKeywords.some(keyword => commentLower.includes(keyword));

        if (hasPositive && !hasNegative) positive++;
        else if (hasNegative && !hasPositive) negative++;
        else neutral++;
    });

    charts.sentiment = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
                data: [positive, negative, neutral],
                backgroundColor: [
                    'rgba(75, 192, 75, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(201, 203, 207, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 75, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(201, 203, 207, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function updatePriceChart(products) {
    const ctx = document.getElementById('priceChart');
    if (!ctx) return;

    if (charts.price) charts.price.destroy();

    charts.price = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Product Price vs Sales',
                data: products.map(p => ({
                    x: p.price,
                    y: p.sales,
                    r: p.stock / 5
                })),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                x: { title: { display: true, text: 'Price ($)' } },
                y: { title: { display: true, text: 'Sales (units)' } }
            }
        }
    });
}

function updateCategoryChart(products) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (charts.category) charts.category.destroy();

    const categories = {};
    products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });

    charts.category = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                label: 'Number of Products',
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 75, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 75, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

function updateRecentReviews() {
    const container = document.getElementById('recent-reviews');
    if (!container || !dashboardData.reviews) return;

    const recentReviews = dashboardData.reviews.slice(-5);

    container.innerHTML = recentReviews.map(review => `
        <div class="review-item-dashboard">
            <p class="review-rating">${'⭐'.repeat(review.rating)}</p>
            <p class="review-comment">"${review.comment}"</p>
        </div>
    `).join('');
}

async function restockProducts() {
    if (!dashboardData) return;

    try {
        const updateData = {
            updates: dashboardData.products.map(p => ({
                id: p.id,
                stock: p.stock + 50
            }))
        };

        const response = await fetch(`${API_URL}/restock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Restock failed');

        // Update local data
        updateData.updates.forEach(update => {
            const product = dashboardData.products.find(p => p.id === update.id);
            if (product) product.stock = update.stock;
        });

        updateDashboard();
        alert('Stock increased by 50 units for each product!');
    } catch (error) {
        alert('Failed to restock: ' + error.message);
    }
}

function exportReport() {
    if (!dashboardData) return;

    const report = {
        timestamp: new Date().toISOString(),
        products: dashboardData.products,
        reviews: dashboardData.reviews,
        statistics: {
            totalProducts: dashboardData.products.length,
            totalSales: dashboardData.products.reduce((sum, p) => sum + p.sales, 0),
            averageRating: (dashboardData.products.reduce((sum, p) => sum + p.avgRating, 0) / dashboardData.products.length).toFixed(1),
            lowStockItems: dashboardData.products.filter(p => p.stock < 30).length
        }
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `retail-dashboard-report-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
}
