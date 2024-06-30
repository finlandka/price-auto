const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const excelRoutes = require('./routes/excelRoutes');
const priceListRoutes = require('./routes/priceListRoutes');
const { validateOrder, submitOrder } = require('./controllers/orderController');

const app = express();
const { PORT, NODE_ENV, DB_URL = 'mongodb://127.0.0.1:27017/auto' } = process.env;

mongoose.connect(DB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet.contentSecurityPolicy({
    directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "default-src": ["'self'"],
        "frame-src": ["'self'", "https://www.google.com", "https://www.gstatic.com"],
        "script-src": ["'self'", "https://www.google.com", "https://www.gstatic.com"],
    },
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // Лимит 100 запросов с одного IP
});
app.use('/api', apiLimiter);

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// Логирование в режиме разработки
if (NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

// API routes
app.use('/api', userRoutes);
app.use('/api', excelRoutes);
app.use('/api', priceListRoutes);
app.post('/api/submit-order', validateOrder, submitOrder);

// Error handling middleware
app.use((err, req, res, _next) => {
    console.error(err.stack);
    const { statusCode = 500, message } = err;
    res.status(statusCode).json({
        message: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : message,
    });
});

// Serve React app for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});