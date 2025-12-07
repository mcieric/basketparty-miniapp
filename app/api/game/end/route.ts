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
        // CUMULATIVE Logic: Add score to existing total (zincrby)
        await redis.zincrby('leaderboard:alltime', score, address);

        // Get new total for response
        const newTotalStr = await redis.zscore('leaderboard:alltime', address);
        const newTotal = newTotalStr ? parseInt(newTotalStr, 10) : score;

        // Save User Metadata (Hash)
        if (name || avatar) {
            await redis.hset(`user:${address}`, {
                name: name || "",
                avatar: avatar || "",
                updated_at: Date.now()
            });
        }

        console.log(`[SCORE SAVED] User: ${address}, Added: ${score}, New Total: ${newTotal}`);

        return NextResponse.json({
            success: true,
            score_added: score,
            new_total_score: newTotal
        });

    } catch (error) {
        console.error("Score save failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
