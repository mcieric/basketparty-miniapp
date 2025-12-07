import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Check Env Vars (masked)
        const hasUrl = !!process.env.KV_REST_API_URL;
        const hasToken = !!process.env.KV_REST_API_TOKEN;

        if (!hasUrl || !hasToken) {
            return NextResponse.json({
                status: "ERROR",
                message: "Missing Environment Variables",
                env: { KV_REST_API_URL: hasUrl, KV_REST_API_TOKEN: hasToken },
            });
        }

        // 2. Test Write
        const timestamp = Date.now();
        await kv.set("debug:test", timestamp);

        // 3. Test Read
        const readBack = await kv.get("debug:test");

        // 4. Check Leaderboard
        const leaderboard = await kv.zrange("leaderboard:alltime", 0, 5, {
            rev: true,
            withScores: true,
        });

        return NextResponse.json({
            status: "OK",
            write_read_test: readBack === timestamp ? "SUCCESS" : "FAILED",
            leaderboard_preview: leaderboard,
            env_check: "OK",
        });
    } catch (error) {
        return NextResponse.json({
            status: "EXCEPTION",
            error: String(error),
        });
    }
}
