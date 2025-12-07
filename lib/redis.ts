import Redis from 'ioredis';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }

    // Fallback for build time or local dev without env vars
    console.warn("WARN: REDIS_URL not defined. Using dummy connection.");
    return "redis://localhost:6379";
};

export const redis = new Redis(getRedisUrl(), {
    lazyConnect: true // Don't connect immediately
});
