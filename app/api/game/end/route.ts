import { redis } from "@/lib/redis";
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
        const currentScoreStr = await redis.zscore('leaderboard:alltime', address);
        const currentScore = currentScoreStr ? parseInt(currentScoreStr, 10) : null;

        let newHighScore = false;
        if (currentScore === null || score > currentScore) {
            await redis.zadd('leaderboard:alltime', score, address);
            newHighScore = true;
        }

        // Save User Metadata (Hash)
        if (name || avatar) {
            await redis.hset(`user:${address}`, {
                name: name || "",
                avatar: avatar || "",
                updated_at: Date.now()
            });
        }

        console.log(`[SCORE SAVED] User: ${address}, Score: ${score}, GameID: ${game_id}`);

        return NextResponse.json({
            success: true,
            new_high_score: newHighScore
        });

    } catch (error) {
        console.error("Score save failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
