import Redis from 'ioredis';



// Mock Redis for local development if no URL is provided
class MockRedis {
    private store = new Map<string, Map<string, number>>(); // key -> (member -> score)

    // private expirations = new Map<string, number>();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async get(key: string) {
        console.log(`[MockRedis] GET ${key}`);
        return null; // Simple KV not used for leaderboard
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async set(key: string, value: string, ...args: any[]) {
        console.log(`[MockRedis] SET ${key} ${value}`, args);
        return 'OK';
    }

    async zincrby(key: string, increment: number, member: string) {
        console.log(`[MockRedis] ZINCRBY ${key} ${increment} ${member}`);
        if (!this.store.has(key)) {
            this.store.set(key, new Map());
        }
        const set = this.store.get(key)!;
        const currentScore = set.get(member) || 0;
        const newScore = currentScore + increment;
        set.set(member, newScore);
        return newScore.toString();
    }

    async zscore(key: string, member: string) {
        const set = this.store.get(key);
        const score = set?.get(member);
        return score !== undefined ? score.toString() : null;
    }

    async zrevrange(key: string, start: number, stop: number, withScores?: string) {
        console.log(`[MockRedis] ZREVRANGE ${key} ${start} ${stop}`);
        if (!this.store.has(key)) return [];

        const set = this.store.get(key)!;
        // Convert to array, sort desc by score
        const sorted = Array.from(set.entries()).sort((a, b) => b[1] - a[1]);
        const sliced = sorted.slice(start, stop + 1); // Redis is inclusive

        if (withScores === 'WITHSCORES') {
            return sliced.flatMap(([member, score]) => [member, score.toString()]);
        }
        return sliced.map(([member]) => member);
    }

    async zrevrank(key: string, member: string) {
        if (!this.store.has(key)) return null;
        const set = this.store.get(key)!;
        const sorted = Array.from(set.entries()).sort((a, b) => b[1] - a[1]);
        const index = sorted.findIndex(([m]) => m === member);
        return index !== -1 ? index : null;
    }

    async expire(key: string, seconds: number) {
        console.log(`[MockRedis] EXPIRE ${key} ${seconds}`);
        return 1;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async hset(key: string, data: any) {
        console.log(`[MockRedis] HSET ${key}`, data);
        return 1;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async hgetall(_key: string) {
        return {}; // Return empty metadata
    }
}

export const redis = (process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new MockRedis()) as unknown as Redis;
