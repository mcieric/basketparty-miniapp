import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, score, game_id } = body;

        if (!address || score === undefined || !game_id) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Basic validation
        if (score < 0 || score > 1000) { // arbitrary sanity check
            return NextResponse.json({ error: "Invalid score" }, { status: 400 });
        }

        // TODO: Save to Supabase
        console.log(`[SCORE SAVED] User: ${address}, Score: ${score}, GameID: ${game_id}`);

        return NextResponse.json({
            success: true,
            new_high_score: true // Mock
        });

    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
