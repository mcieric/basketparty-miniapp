import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    // const period = searchParams.get('period') || 'alltime'; 

    const userAddress = searchParams.get('user');

    try {
        const LEADERBOARD_KEY = 'leaderboard:alltime';

        // Fetch Top 50
        // ioredis zrange with WITHSCORES returns ['member1', 100, 'member2', 90, ...]
        const rawLeaderboard = await redis.zrevrange(LEADERBOARD_KEY, 0, 49, 'WITHSCORES');

        const topEntries: { member: string, score: number }[] = [];
        for (let i = 0; i < rawLeaderboard.length; i += 2) {
            topEntries.push({
                member: rawLeaderboard[i],
                score: parseFloat(rawLeaderboard[i + 1])
            });
        }

        // Hydrate with metadata
        const leaderboard = await Promise.all(topEntries.map(async (entry, index) => {
            const address = entry.member;
            const score = entry.score;

            // Fetch user metadata
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const metadata: any = await redis.hgetall(`user:${address}`);

            return {
                rank: index + 1,
                address: address,
                name: metadata?.name || undefined,
                avatar: metadata?.avatar || undefined,
                score: score,
                isUser: userAddress ? (address.toLowerCase() === userAddress.toLowerCase()) : false
            };
        }));

        // Get Current User Rank
        let userRank = null;
        if (userAddress) {
            // check if user is in the fetched list first
            const inList = leaderboard.find(e => e.isUser);
            if (inList) {
                userRank = inList;
            } else {
                // Fetch independently
                const rank = await redis.zrevrank(LEADERBOARD_KEY, userAddress);
                const scoreStr = await redis.zscore(LEADERBOARD_KEY, userAddress);
                const score = scoreStr ? parseFloat(scoreStr) : null;

                if (rank !== null && score !== null) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const metadata: any = await redis.hgetall(`user:${userAddress}`);
                    userRank = {
                        rank: rank + 1,
                        score: score,
                        address: userAddress,
                        name: metadata?.name || "YOU",
                        avatar: metadata?.avatar || undefined
                    };
                } else {
                    // User has no score yet
                    userRank = {
                        rank: null,
                        score: 0,
                        address: userAddress,
                        name: "YOU",
                        avatar: undefined
                    }
                }
            }
        }

        return NextResponse.json({
            leaderboard,
            userRank
        });

    } catch (error) {
        console.error("Leaderboard fetch failed:", error);
        // Fallback to empty or error
        return NextResponse.json({ leaderboard: [], userRank: null });
    }
}
