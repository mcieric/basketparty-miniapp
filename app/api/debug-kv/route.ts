import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Check Env Vars (masked)
        const varsToCheck = [
            "KV_REST_API_URL",
            "KV_REST_API_TOKEN",
            "KV_URL",
            "REDIS_URL"
        ];

        const envStatus = varsToCheck.reduce((acc, key) => {
            acc[key] = !!process.env[key];
            return acc;
        }, {} as Record<string, boolean>);

        const hasUrl = !!process.env.KV_REST_API_URL;
        const hasToken = !!process.env.KV_REST_API_TOKEN;

        if (!hasUrl || !hasToken) {
            return NextResponse.json({
                status: "ERROR",
                message: "Missing Required Environment Variables for @vercel/kv",
                debug: "Did you 'Connect Project' in Vercel Storage?",
                env_check: envStatus,
                note: "If you just linked the database, you MUST redeploy the project for it to work."
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
            env_check: envStatus,
        });
    } catch (error) {
        return NextResponse.json({
            status: "EXCEPTION",
            error: String(error),
            env_check: {
                KV_REST_API_URL: !!process.env.KV_REST_API_URL,
                KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN
            }
        });
    }
}
