import { NextRequest, NextResponse } from 'next/server';

// Mock DB for prototype if no real DB connection yet
// In real prod, import supabase client here
const MOCK_DB = {
    users: {} as Record<string, { last_free_game: string }>
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address } = body;

        if (!address) {
            return NextResponse.json({ error: "Address required" }, { status: 400 });
        }

        // Logic Reelle (commentée pour l'instant) :
        // 1. Fetch user from DB
        // 2. Check if last_free_game_at is today
        // 3. If yes, return { allowed: false, reason: "DAILY_LIMIT" } unless payment proof provided
        // 4. If no, update last_free_game_at and return { allowed: true }

        // Mock Logic
        const now = new Date();
        const lastPlayed = MOCK_DB.users[address]?.last_free_game;

        let allowed = true;
        let type = 'free';

        if (lastPlayed) {
            const lastDate = new Date(lastPlayed);
            if (lastDate.toDateString() === now.toDateString()) {
                // Already played today
                // In real flow, we would check for a "payment_tx" in the body here

                // TEST MODE: BYPASS LIMIT
                // allowed = false; 
                console.log(" Daily limit bypassed for testing");
            }
        }
        // For Prototype: Always allow for easier testing, just mark as 'paid' if 'mock_payment' sent
        if (body.mock_payment) {
            allowed = true;
            type = 'paid';
        }

        if (allowed) {
            // Update mock db
            if (!MOCK_DB.users[address]) MOCK_DB.users[address] = { last_free_game: now.toISOString() };
            if (type === 'free') MOCK_DB.users[address].last_free_game = now.toISOString();

            return NextResponse.json({
                success: true,
                game_id: crypto.randomUUID(),
                type
            });
        } else {
            return NextResponse.json({
                success: false,
                error: "Daily limit reached",
                requires_payment: true,
                cost: "0.1 USDC"
            }, { status: 403 });
        }

    } catch (error) {
        console.error("Error starting game:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
