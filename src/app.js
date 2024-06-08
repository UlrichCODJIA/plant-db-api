const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUI = require('swagger-ui-express');

const app = express();

require('dotenv').config()
const { initializeRedisClient } = require("./middlewares/redis");
const connectDB = require('./config/db');
const plantRoutes = require('./routes/plant');
const authRoutes = require('./routes/auth');
const swaggerSpec = require('./swagger');
const logger = require('./utils/logger');

async function initializeExpressServer() {
    // Connect to MongoDB
    await connectDB();

    // Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(compression());

    // Rate limiting middleware
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    });
    app.use(limiter);

    // connect to Redis
    const redisClient = await initializeRedisClient();

    app.use((req, res, next) => {
        req.redisClient = redisClient;
        next();
    });

    // Routes
    app.use('/api/plants', plantRoutes);
    app.use('/api/auth', authRoutes);
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

    // Error handling middleware
    app.use((err, req, res, next) => {
        logger.error(err.stack);
        res.status(500).json({ error: 'Server error' });
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

    module.exports = app;
}

initializeExpressServer()
    .then()
    .catch((e) => console.error(e));