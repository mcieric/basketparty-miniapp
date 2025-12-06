import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'alltime'; // 'daily' or 'alltime'

    // Generate some mock data
    const isDaily = period === 'daily';
    const seed = isDaily ? 'daily_seed' : 'alltime_seed';
    const scoreMultiplier = isDaily ? 0.3 : 1; // Daily scores are lower

    const mockLeaderboard = Array.from({ length: 10 }).map((_, i) => ({
        rank: i + 1,
        address: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        name: i % 3 === 0 ? `player${i}.base.eth` : undefined, // Some have names
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}_${i}`,
        score: Math.floor((Math.random() * (500 - 50) + 50) * (10 - i) * scoreMultiplier), // Descendingish scores
        isUser: i === 3 // Fake the user being 4th
    })).sort((a, b) => b.score - a.score).map((Item, index) => ({ ...Item, rank: index + 1 }));

    return NextResponse.json({
        leaderboard: mockLeaderboard,
        userRank: {
            rank: 4,
            score: Math.floor(1250 * scoreMultiplier),
            address: "0xYour...Wallet",
            name: "you.base.eth",
            avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=you"
        }
    });
}
