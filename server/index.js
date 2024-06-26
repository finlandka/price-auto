const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const excelRoutes = require('./routes/excelRoutes');
const priceListRoutes = require('./routes/priceListRoutes');
const { validateOrder, submitOrder } = require('./controllers/orderController');

const app = express();
app.use(express.json());

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/auto' } = process.env;
mongoose.connect(DB_URL, {});

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.use('/api', userRoutes);
app.use('/api', excelRoutes);
app.use('/api', priceListRoutes);
app.post('/api/submit-order', validateOrder, submitOrder);

app.use ((err, req, res, next) => {
    const { statusCode = 500, message } = err;
    res.status(statusCode).send({
        message: (statusCode === 500) ? 'INTERNAL_SERVER' : message,
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

app.listen(PORT);