import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    // const period = searchParams.get('period') || 'alltime';
    // const isDaily = period === 'daily'; 

    // For now, map 'daily' to 'alltime' or implement daily keys if needed later.
    // Let's stick to one 'leaderboard:alltime' for simplicity as requested, 
    // or use 'leaderboard:daily' if we set expiry. keeping it simple: 'leaderboard:alltime'.

    const userAddress = searchParams.get('user');

    try {
        const LEADERBOARD_KEY = 'leaderboard:alltime';

        // Fetch Top 50
        // zrange returns array of { member, score } if validated, or flat array.
        // Vercel KV (upstash) returns [{ member, score }, ...] with withScores: true
        const topEntries = await kv.zrange(LEADERBOARD_KEY, 0, 49, { rev: true, withScores: true });

        // Hydrate with metadata
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leaderboard = await Promise.all(topEntries.map(async (entry: any, index: number) => {
            // Entry structure depends on library version/adapter. 
            // If using @vercel/kv directly, it returns objects { member: string, score: number }
            const address = entry.member as string;
            const score = entry.score;

            // Fetch user metadata
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const metadata: any = await kv.hgetall(`user:${address}`);

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
                const rank = await kv.zrevrank(LEADERBOARD_KEY, userAddress);
                const score = await kv.zscore(LEADERBOARD_KEY, userAddress);

                if (rank !== null && score !== null) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const metadata: any = await kv.hgetall(`user:${userAddress}`);
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
