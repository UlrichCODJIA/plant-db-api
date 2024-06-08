const { createClient } = require("redis");
const hash = require("object-hash");

let redisClient = undefined;

async function initializeRedisClient() {
    const redisURL = process.env.REDIS_URI;
    if (redisURL) {
        redisClient = createClient({ url: redisURL });

        redisClient.on("error", (err) => {
            console.error("Redis connection error:", err);
        });

        redisClient.on("connect", () => {
            console.log("Connected to Redis");
        });

        redisClient.on("reconnecting", () => {
            console.log("Reconnecting to Redis...");
        });

        try {
            await redisClient.connect();
            return redisClient
        } catch (error) {
            console.error("Failed to connect to Redis:", error);
            redisClient = undefined;
        }
    }
}

function requestToKey(req) {
    const { method, originalUrl, query, body } = req;
    const requestData = {
        method,
        originalUrl,
        query,
        body,
    };
    return `${method}:${originalUrl}@${hash.sha1(requestData)}`;
}

function isRedisConnected() {
    return redisClient?.isOpen || false;
}

async function cacheData(key, data, expire) {
    if (isRedisConnected()) {
        try {
            if (expire) {
                await redisClient.set(key, JSON.stringify(data), { EX: expire });
            } else {
                await redisClient.set(key, JSON.stringify(data));
            }
        } catch (error) {
            console.error(`Failed to cache data for key=${key}:`, error);
        }
    }
}

async function getCachedData(key) {
    if (isRedisConnected()) {
        try {
            const cachedData = await redisClient.get(key);
            return cachedData ? JSON.parse(cachedData) : undefined;
        } catch (error) {
            console.error(`Failed to get cached data for key=${key}:`, error);
        }
    }
    return undefined;
}

function redisCachingMiddleware(expire) {
    return async (req, res, next) => {
        if (isRedisConnected()) {
            const key = requestToKey(req);
            const cachedData = await getCachedData(key);

            if (cachedData) {
                res.json(cachedData);
            } else {
                const originalSend = res.send;

                res.send = function (data) {
                    res.send = originalSend;

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        cacheData(key, data, expire);
                    }

                    res.send(data);
                };

                next();
            }
        } else {
            next();
        }
    };
}

module.exports = { initializeRedisClient, redisCachingMiddleware };