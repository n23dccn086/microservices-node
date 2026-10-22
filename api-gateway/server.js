const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

const forward = async (req, res, target) => {
    try {
        const response = await axios({
            method: req.method,
            url: target + req.originalUrl,
            data: req.body,
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
            validateStatus: () => true
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(503).json({ error: 'Service temporarily unavailable', service: target });
    }
};

app.all('/users*', (req, res) => forward(req, res, USER_SERVICE_URL));
app.all('/products*', (req, res) => forward(req, res, PRODUCT_SERVICE_URL));
app.all('/orders*', (req, res) => forward(req, res, ORDER_SERVICE_URL));

app.get('/health', (req, res) => {
    res.json({ gateway: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({ message: 'Microservices API Gateway', version: '1.0.0' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
