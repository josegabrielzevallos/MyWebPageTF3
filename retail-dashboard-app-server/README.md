# 🖥️ Retail Dashboard Server - Backend Documentation

Express.js RESTful API for the Retail Dashboard e-commerce application.

## Features

- ✅ Complete CRUD operations for products
- ✅ Customer review management with sentiment analysis
- ✅ Order processing and inventory management
- ✅ Real-time sales analytics
- ✅ Persistent JSON-based storage
- ✅ CORS support for cross-origin requests
- ✅ Sentiment keyword detection

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode with auto-reload
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Products API

#### Get All Products
```http
GET /api/products
```
Returns array of all products with calculated average ratings.

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Vitamin D3",
  "price": 18.99,
  "category": "vitamins",
  "stock": 100,
  "description": "High-potency vitamin D3",
  "image": "https://..."
}
```

#### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "stock": 75,
  "price": 16.99
}
```

### Reviews API

#### Get Product Reviews
```http
GET /api/reviews/:productId
```

#### Submit Review
```http
POST /api/reviews
Content-Type: application/json

{
  "productId": 1,
  "rating": 5,
  "comment": "Excellent product, very satisfied!"
}
```

### Orders API

#### Process Checkout
```http
POST /api/checkout
Content-Type: application/json

{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "zip": "10001",
    "card": "1234567890123456"
  },
  "items": [
    {
      "id": 1,
      "name": "Vitamin C",
      "price": 12.99,
      "quantity": 2
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Order processed successfully",
  "totalItems": 2
}
```

### Dashboard API

#### Get Dashboard Data
```http
GET /api/dashboard-data
```

Returns all products with ratings and all reviews for dashboard visualization.

#### Restock Products
```http
POST /api/restock
Content-Type: application/json

{
  "updates": [
    { "id": 1, "stock": 150 },
    { "id": 2, "stock": 100 }
  ]
}
```

#### Get Analytics
```http
GET /api/analytics
```

Returns:
```json
{
  "totalProducts": 6,
  "totalOrders": 5,
  "totalRevenue": 450.50,
  "totalSales": 25,
  "averageRating": "4.3",
  "lowStockItems": 2,
  "sentiment": {
    "positive": 12,
    "negative": 2,
    "neutral": 1
  }
}
```

### Health Check

```http
GET /api/health
```

## Data Structure

### Product Object
```json
{
  "id": 1,
  "name": "Vitamin C 1000mg",
  "price": 12.99,
  "category": "vitamins",
  "stock": 50,
  "image": "https://...",
  "description": "High-potency Vitamin C supplement",
  "reviews": [
    {
      "rating": 5,
      "comment": "Great product!"
    }
  ],
  "sales": 120,
  "avgRating": 4.5
}
```

### Review Object
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "productId": 1,
  "rating": 5,
  "comment": "Excellent product!",
  "timestamp": "2024-01-12T10:30:00.000Z"
}
```

### Order Object
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "zip": "10001",
    "card": "1234567890123456"
  },
  "items": [
    {
      "id": 1,
      "name": "Vitamin C",
      "price": 12.99,
      "quantity": 2
    }
  ],
  "totalAmount": 150.50,
  "timestamp": "2024-01-12T10:35:00.000Z"
}
```

## Sentiment Analysis

The server analyzes customer review sentiment using keyword detection:

### Positive Keywords
- great, excellent, good, amazing, perfect, wonderful, love, fantastic, awesome

### Negative Keywords
- bad, poor, disappointing, broken, terrible, awful, horrible, hate, waste

Comments are classified as:
- **Positive** - Contains positive keywords but no negative ones
- **Negative** - Contains negative keywords but no positive ones
- **Neutral** - All other combinations

## JSON Databases

All data is persisted using JSON files:

### products.json
Contains array of all products with details and reviews.

### reviews.json
Contains array of all customer reviews with timestamps.

### orders.json
Contains array of all completed orders with customer info and totals.

## Environment Variables

```bash
PORT=3000          # Server port (default: 3000)
NODE_ENV=production # Environment type
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include:
```json
{
  "error": "Error message describing what went wrong"
}
```

## CORS Configuration

The server allows cross-origin requests from any origin. For production, configure specific origins:

```javascript
const corsOptions = {
  origin: ['http://localhost:8000', 'https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));
```

## Middleware Stack

1. **CORS** - Handles cross-origin requests
2. **Body Parser** - Parses JSON and URL-encoded bodies
3. **Route Handlers** - Process API requests
4. **Error Handler** - Catches and logs errors

## Testing with cURL

```bash
# Get all products
curl http://localhost:3000/api/products

# Get specific product
curl http://localhost:3000/api/products/1

# Create review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"rating":5,"comment":"Great!"}'

# Get analytics
curl http://localhost:3000/api/analytics

# Health check
curl http://localhost:3000/api/health
```

## Testing with Postman

1. Import the base URL: `http://localhost:3000/api`
2. Create requests for each endpoint
3. Save collection for future use

## Dependencies

- **express** (4.18.2) - Web framework
- **cors** (2.8.5) - Cross-origin middleware
- **body-parser** (1.20.2) - Request parsing
- **uuid** (9.0.0) - ID generation

## Development Dependencies

- **nodemon** (2.0.20) - Auto-restart on file changes

## Production Deployment

For production use:

1. **Use a real database** - MongoDB, PostgreSQL, MySQL
2. **Add authentication** - JWT or sessions
3. **Enable HTTPS** - SSL/TLS certificates
4. **Environment variables** - Use .env files
5. **Rate limiting** - Prevent abuse
6. **Logging** - Winston or Morgan
7. **Validation** - Input sanitization
8. **Error tracking** - Sentry or similar

### Example Production Checklist

```bash
# Install additional packages
npm install dotenv winston express-validator express-rate-limit

# Create .env file
touch .env

# Set environment
export NODE_ENV=production

# Start with process manager
npm install -g pm2
pm2 start server.js --name "retail-api"
```

## File Organization

```
retail-dashboard-app-server/
├── server.js           # Main server file
├── package.json        # Dependencies & scripts
├── package-lock.json   # Lock file
├── products.json       # Product database
├── reviews.json        # Review database
├── orders.json         # Order database
└── node_modules/       # Installed packages
```

## Logs & Debugging

Enable detailed logging:

```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

## Support

For issues or questions:
1. Check API response status codes
2. Review error messages in console
3. Verify JSON file permissions
4. Ensure server is running on correct port

---

**Happy coding! 🚀**
