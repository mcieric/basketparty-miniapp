import Redis from 'ioredis';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    // Return a dummy URL during build if missing, or handle gracefully
    // Using a dummy value allows the build to proceed (static generation).
    // Runtime will fail if used without env var.
    if (process.env.NODE_ENV === 'production') {
        throw new Error("REDIS_URL is not defined in production");
    }
    console.warn("REDIS_URL not defined, using mock/dummy for local development/build");
    return "redis://localhost:6379";
};

export const redis = new Redis(getRedisUrl(), {
    lazyConnect: true // Don't connect immediately
});
