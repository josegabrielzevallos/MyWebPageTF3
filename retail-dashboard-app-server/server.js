/**
 * Retail Dashboard Server
 * Node.js + Express API for product management, reviews, and sales analytics
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/images', express.static(path.join(__dirname, '..', 'retail-dashboard-app', 'images')));

// File paths
const productsFile = path.join(__dirname, 'products.json');
const reviewsFile = path.join(__dirname, 'reviews.json');
const ordersFile = path.join(__dirname, 'orders.json');

// ==================== HELPER FUNCTIONS ====================

/**
 * Load JSON file and return data
 */
function loadJSON(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return filePath === productsFile ? require('./products.json') : [];
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        return filePath === productsFile ? require('./products.json') : [];
    }
}

/**
 * Save JSON file
 */
function saveJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error saving ${filePath}:`, error);
        return false;
    }
}

/**
 * Calculate average rating for a product
 */
function calculateAverageRating(productId, reviews) {
    const productReviews = reviews.filter(r => r.productId === productId);
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / productReviews.length).toFixed(2));
}

/**
 * Analyze sentiment from review comments
 */
function analyzeSentiment(comments) {
    const positiveKeywords = ['great', 'excellent', 'good', 'amazing', 'perfect', 'wonderful', 'love', 'fantastic', 'awesome'];
    const negativeKeywords = ['bad', 'poor', 'disappointing', 'broken', 'terrible', 'awful', 'horrible', 'hate', 'waste'];

    let positive = 0, negative = 0, neutral = 0;

    comments.forEach(comment => {
        const commentLower = comment.toLowerCase();
        const hasPositive = positiveKeywords.some(keyword => commentLower.includes(keyword));
        const hasNegative = negativeKeywords.some(keyword => commentLower.includes(keyword));

        if (hasPositive && !hasNegative) positive++;
        else if (hasNegative && !hasPositive) negative++;
        else neutral++;
    });

    return { positive, negative, neutral };
}

// ==================== PRODUCTS ENDPOINTS ====================

/**
 * GET /api/products - Get all products
 */
app.get('/api/products', (req, res) => {
    try {
        const products = loadJSON(productsFile);
        const reviews = loadJSON(reviewsFile);

        // Add average rating to each product
        const productsWithRatings = products.map(product => ({
            ...product,
            avgRating: calculateAverageRating(product.id, reviews)
        }));

        res.json(productsWithRatings);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

/**
 * GET /api/products/:id - Get specific product
 */
app.get('/api/products/:id', (req, res) => {
    try {
        const products = loadJSON(productsFile);
        const product = products.find(p => p.id === parseInt(req.params.id));

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

/**
 * POST /api/products - Create new product (admin only)
 */
app.post('/api/products', (req, res) => {
    try {
        const { name, price, category, stock, description, image } = req.body;

        if (!name || !price || !category || stock === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const products = loadJSON(productsFile);
        const newProduct = {
            id: Math.max(...products.map(p => p.id), 0) + 1,
            name,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            description: description || '',
            image: image || 'https://via.placeholder.com/250x250?text=' + encodeURIComponent(name),
            reviews: [],
            sales: 0
        };

        products.push(newProduct);
        saveJSON(productsFile, products);

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

/**
 * PUT /api/products/:id - Update product
 */
app.put('/api/products/:id', (req, res) => {
    try {
        const products = loadJSON(productsFile);
        const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const { stock, price } = req.body;
        if (stock !== undefined) products[productIndex].stock = parseInt(stock);
        if (price !== undefined) products[productIndex].price = parseFloat(price);

        saveJSON(productsFile, products);
        res.json(products[productIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// ==================== REVIEWS ENDPOINTS ====================

/**
 * GET /api/reviews/:productId - Get reviews for a product
 */
app.get('/api/reviews/:productId', (req, res) => {
    try {
        const reviews = loadJSON(reviewsFile);
        const productReviews = reviews.filter(r => r.productId === parseInt(req.params.productId));
        res.json(productReviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

/**
 * POST /api/reviews - Create new review
 */
app.post('/api/reviews', (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        if (!productId || !rating || !comment) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const reviews = loadJSON(reviewsFile);
        const newReview = {
            id: uuidv4(),
            productId: parseInt(productId),
            rating: parseInt(rating),
            comment: comment.trim(),
            timestamp: new Date().toISOString()
        };

        reviews.push(newReview);
        saveJSON(reviewsFile, reviews);

        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// ==================== CHECKOUT & ORDERS ====================

/**
 * POST /api/checkout - Process checkout
 */
app.post('/api/checkout', (req, res) => {
    try {
        const { customer, items } = req.body;

        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ error: 'Invalid checkout data' });
        }

        // Update product stock
        const products = loadJSON(productsFile);
        let totalSales = 0;

        items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                product.stock = Math.max(0, product.stock - item.quantity);
                product.sales = (product.sales || 0) + item.quantity;
                totalSales += item.quantity;
            }
        });

        saveJSON(productsFile, products);

        // Create order record
        const orders = loadJSON(ordersFile);
        const newOrder = {
            id: uuidv4(),
            customer,
            items,
            totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString()
        };

        orders.push(newOrder);
        saveJSON(ordersFile, orders);

        res.status(201).json({
            success: true,
            orderId: newOrder.id,
            message: 'Order processed successfully',
            totalItems: totalSales
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to process checkout' });
    }
});

// ==================== DASHBOARD DATA ====================

/**
 * GET /api/dashboard-data - Get all data for dashboard
 */
app.get('/api/dashboard-data', (req, res) => {
    try {
        const products = loadJSON(productsFile);
        const reviews = loadJSON(reviewsFile);

        const dashboardData = {
            products: products.map(product => ({
                ...product,
                avgRating: calculateAverageRating(product.id, reviews)
            })),
            reviews: reviews
        };

        res.json(dashboardData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

/**
 * POST /api/restock - Increase stock for products
 */
app.post('/api/restock', (req, res) => {
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates)) {
            return res.status(400).json({ error: 'Invalid restock data' });
        }

        const products = loadJSON(productsFile);

        updates.forEach(update => {
            const product = products.find(p => p.id === update.id);
            if (product) {
                product.stock = parseInt(update.stock);
            }
        });

        saveJSON(productsFile, products);
        res.json({ success: true, message: 'Stock updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to restock' });
    }
});

/**
 * GET /api/analytics - Get sales analytics
 */
app.get('/api/analytics', (req, res) => {
    try {
        const products = loadJSON(productsFile);
        const reviews = loadJSON(reviewsFile);
        const orders = loadJSON(ordersFile);

        const comments = reviews.map(r => r.comment);
        const sentiment = analyzeSentiment(comments);

        const analytics = {
            totalProducts: products.length,
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
            totalSales: products.reduce((sum, p) => sum + (p.sales || 0), 0),
            averageRating: (products.reduce((sum, p) => sum + calculateAverageRating(p.id, reviews), 0) / products.length).toFixed(2),
            lowStockItems: products.filter(p => p.stock < 30).length,
            sentiment: sentiment
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// ==================== UTILITY ENDPOINTS ====================

/**
 * GET /api/health - Server health check
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`

  Server running on: http://localhost:${PORT}               
  API available at: http://localhost:${PORT}/api          
  Health check: http://localhost:${PORT}/api/health        

    `);
});

module.exports = app;
