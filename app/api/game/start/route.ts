import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, mock_payment } = body; // mock_payment used for frontend sim, to be removed/secured in prod

        if (!address) {
            return NextResponse.json({ error: "Address required" }, { status: 400 });
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const QUOTA_KEY = `daily_quota:${address}:${today}`;

        // Check if user has already played free today
        const hasPlayedFree = await redis.get(QUOTA_KEY);

        if (hasPlayedFree && !mock_payment) {
            return NextResponse.json({
                success: false,
                error: "Daily limit reached",
                requires_payment: true,
                cost: "0.1 USDC"
            }, { status: 403 });
        }

        // If paying (mock_payment for now, real tx verification later) OR free quota available
        // In a real app we would verify the tx hash here if it was a paid game.

        let type = 'free';
        if (mock_payment) {
            type = 'paid';
        } else {
            // Mark free quota as used (expire in 24h to be safe, though key includes date)
            await redis.set(QUOTA_KEY, "1", "EX", 86400);
        }

        return NextResponse.json({
            success: true,
            game_id: crypto.randomUUID(),
            type
        });

    } catch (error) {
        console.error("Error starting game:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
