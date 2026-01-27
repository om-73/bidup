const Redis = require('ioredis');
const MockRedis = require('ioredis-mock');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL;
const useMock = process.env.USE_REDIS_MOCK === 'true' || process.env.NODE_ENV === 'test' || !redisUrl;

let redis;

if (useMock) {
    console.log('Using ioredis-mock for persistence (Data will be ephemeral)');
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        console.warn('CRITICAL: REDIS_URL not provided. Vercel/Render will DELETE your data on every request.');
        console.warn('FOLLOW THIS GUIDE: https://github.com/om-73/bidup/blob/main/REDIS_SETUP.md');
    }
    redis = new MockRedis();
} else {
    const config = {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
            if (times > 10) {
                console.warn('Redis connection failed 10 times. Falling back to mock for this session.');
                return null;
            }
            return Math.min(times * 200, 5000);
        }
    };

    // Upstash and many cloud providers require TLS for rediss:// URLs
    if (redisUrl.startsWith('rediss://')) {
        config.tls = { rejectUnauthorized: false };
    }

    redis = new Redis(redisUrl, config);

    redis.on('error', (err) => {
        if (err.code !== 'ECONNREFUSED') {
            console.error('Redis error:', err);
        }
    });

    redis.on('connect', () => {
        console.log('Connected to Redis');
    });
}

redis.isPersistent = !useMock;
module.exports = redis;
