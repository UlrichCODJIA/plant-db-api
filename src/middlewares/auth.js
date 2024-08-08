const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate the user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const jti = decoded.jti;
        const redisClient = req.redisClient;
        const isBlacklisted = await redisClient.get(jti);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token is blacklisted' });
        }
        const user = await User.findById(decoded.id);

        if (!user) {
            logger.error(`User id ${decoded.id} not found.`);
            throw new Error();
        }

        req.user = user;
        req.jti = jti;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

/**
 * Middleware to authorize the user based on the role.
 *
 * @param {string[]} roles - The allowed roles.
 * @returns {Function} The middleware function.
 */
exports.authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};

/**
 * Middleware to authenticate the Sync Service.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
exports.authenticateSync = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.SYNC_TOKEN_SECRET);
        const sync_service_secret = decoded.secret;

        if (sync_service_secret != process.env.SYNC_SERVICE_SECRET) {
            throw new Error();
        }
        next();
    } catch (err) {
        res.status(403).json({ error: 'Access denied' });
    }
};

/**
 * Middleware to authenticate the chatbot service.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
exports.authenticateChat = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        jwt.verify(token, process.env.CHATBOT_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(403).json({ error: 'Invalid token' });
            }
            if (decoded.sub != 'chatbot_microservice') {
                return res.status(403).json({ error: 'Access denied' });
            }
            next();
        });
    } catch (err) {
        res.status(403).json({ error: 'Access denied' });
    }
};