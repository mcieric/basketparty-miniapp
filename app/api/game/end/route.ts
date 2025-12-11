import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from 'next/server';

import { verifyMessage } from 'viem';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, score, game_id, name, avatar, signature } = body;

        if (!address || score === undefined || !game_id || !signature) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Verify Signature
        try {
            const message = `GameId:${game_id}:Score:${score}`;
            const valid = await verifyMessage({
                address: address as `0x${string}`,
                message: message,
                signature: signature as `0x${string}`,
            });

            if (!valid) {
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            }
        } catch (err) {
            console.error("Signature verification error:", err);
            return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
        }

        // Basic validation
        if (score < 0 || score > 50000) {
            return NextResponse.json({ error: "Invalid score" }, { status: 400 });
        }

        // Save Score to Leaderboard (Sorted Set)
        // CUMULATIVE Logic: Add score to existing total (zincrby)
        await redis.zincrby('leaderboard:alltime', score, address);

        // Save to Daily Leaderboard
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const dailyKey = `leaderboard:daily:${today}`;
        await redis.zincrby(dailyKey, score, address);
        await redis.expire(dailyKey, 60 * 60 * 24 * 7); // Keep daily data for 7 days

        // Get new total for response (from all-time)
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
