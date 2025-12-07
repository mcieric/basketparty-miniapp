import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'alltime'; // 'daily' or 'alltime'

    const userAddress = searchParams.get('user');

    // Generate some mock data
    const isDaily = period === 'daily';
    const seed = isDaily ? 'daily_seed' : 'alltime_seed';
    const scoreMultiplier = isDaily ? 0.3 : 1; // Daily scores are lower

    let mockLeaderboard = Array.from({ length: 10 }).map((_, i) => {
        // Deterministic mock addresses based on index
        const mockAddr = `0x${(i + 10).toString(16).repeat(10)}`;
        return {
            rank: i + 1,
            address: i === 3 && userAddress ? userAddress : mockAddr, // Force 4th place to be user for demo if userAddress exists
            name: i === 3 && userAddress ? 'YOU' : i === 0 ? 'king.base.eth' : `player${i}.base.eth`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i === 3 && userAddress ? userAddress : seed + i}`, // Reliable avatar API
            score: Math.floor((500 - i * 40) * scoreMultiplier), // Descending scores
            isUser: (i === 3 && !!userAddress) // Mark as user if it matches
        };
    });

    // If user is not in the top list (which is fixed above for demo), we would search or append.
    // For this demo, we forced them at rank 4.

    // Check if we actually have the user in the list
    const userEntry = mockLeaderboard.find(e => e.address === userAddress);

    // If we didn't force them (e.g. logic changed), ensure we return a userRank
    const userRank = userEntry || {
        rank: 42,
        score: 0,
        address: userAddress || "0x...",
        name: "Anonymous",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userAddress || 'anon'}`
    };

    return NextResponse.json({
        leaderboard: mockLeaderboard,
        userRank: userRank
    });
}
