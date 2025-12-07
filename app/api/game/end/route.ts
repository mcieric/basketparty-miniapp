import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, score, game_id, name, avatar } = body;

        if (!address || score === undefined || !game_id) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Basic validation
        if (score < 0 || score > 50000) {
            return NextResponse.json({ error: "Invalid score" }, { status: 400 });
        }

        // Save Score to Leaderboard (Sorted Set)
        // High Score Logic: Check if new score is higher than current


        const currentScore = await kv.zscore('leaderboard:alltime', address);
        if (!currentScore || score > currentScore) {
            await kv.zadd('leaderboard:alltime', { score, member: address });
        }

        // Save User Metadata (Hash)
        if (name || avatar) {
            await kv.hset(`user:${address}`, {
                name: name || undefined,
                avatar: avatar || undefined,
                updated_at: Date.now()
            });
        }

        console.log(`[SCORE SAVED] User: ${address}, Score: ${score}, GameID: ${game_id}`);

        return NextResponse.json({
            success: true,
            new_high_score: !currentScore || score > currentScore
        });

    } catch (error) {
        console.error("Score save failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
