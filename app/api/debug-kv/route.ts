import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Scan available Env Vars (Masked values)
        const relevantKeys = Object.keys(process.env).filter(key =>
            key.includes("KV") ||
            key.includes("REDIS") ||
            key.includes("STORAGE") ||
            (key.includes("URL") || key.includes("TOKEN"))
        );

        const envDebug = relevantKeys.reduce((acc, key) => {
            const val = process.env[key] || "";
            acc[key] = val.startsWith("http") ? "Starts with http..." :
                val.startsWith("redis") ? "Starts with redis..." :
                    val ? "Present (Masked)" : "Missing";
            return acc;
        }, {} as Record<string, string>);

        // Check specifically for expected ones
        const config = {
            url: process.env.KV_REST_API_URL || process.env.KV_URL,
            token: process.env.KV_REST_API_TOKEN || process.env.KV_TOKEN,
        };

        if (!config.url || !config.token) {
            return NextResponse.json({
                status: "CONFIG_ERROR",
                message: "Standard @vercel/kv vars missing. See 'env_found' for what is available.",
                env_found: envDebug,
                note: "If you used a Custom Prefix (e.g. STORAGE), you need to update the connection config."
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
            env_check: envDebug,
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
