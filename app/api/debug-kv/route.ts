import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Check Config
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            return NextResponse.json({
                status: "CONFIG_ERROR",
                message: "REDIS_URL is missing.",
                note: "Please Check Vercel Storage settings."
            });
        }

        // 2. Test Write
        const timestamp = Date.now();
        await redis.set("debug:test", timestamp);

        // 3. Test Read
        const readBack = await redis.get("debug:test");

        // 4. Check Leaderboard
        const leaderboard = await redis.zrevrange("leaderboard:alltime", 0, 5, 'WITHSCORES');

        return NextResponse.json({
            status: "OK",
            mode: "TCP (ioredis)",
            write_read_test: String(readBack) == String(timestamp) ? "SUCCESS" : "FAILED",
            leaderboard_preview: leaderboard,
            url_masked: redisUrl.substring(0, 15) + "..."
        });
    } catch (error) {
        return NextResponse.json({
            status: "EXCEPTION",
            error: String(error),
            params: {
                redis_url_present: !!process.env.REDIS_URL
            }
        });
    }
}
