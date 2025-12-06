import { Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
    rank: number;
    address: string;
    score: number;
    isUser?: boolean;
    name?: string;
    avatar?: string;
}

interface LeaderboardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function Leaderboard({ open, onOpenChange }: LeaderboardProps) {
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"daily" | "alltime">("daily");

    useEffect(() => {
        if (open) {
            setLoading(true);
            fetch(`/api/leaderboard?period=${period}`)
                .then(res => res.json())
                .then(json => {
                    setData(json.leaderboard);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [open, period]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* MODAL */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-6 overflow-hidden"
                    >
                        {/* HEADER */}
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex justify-between items-center">
                                <h2 className="flex items-center gap-2 text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    LEADERBOARD
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onOpenChange(false)}
                                    className="text-muted-foreground hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* TABS */}
                            <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800">
                                <button
                                    onClick={() => setPeriod("daily")}
                                    className={cn(
                                        "flex-1 py-1.5 text-sm font-bold rounded-md transition-all",
                                        period === "daily" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    JOURNALIER
                                </button>
                                <button
                                    onClick={() => setPeriod("alltime")}
                                    className={cn(
                                        "flex-1 py-1.5 text-sm font-bold rounded-md transition-all",
                                        period === "alltime" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    TOTAL
                                </button>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="relative">
                            {loading ? (
                                <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
                                    Loading scores...
                                </div>
                            ) : (
                                <div className="h-[60vh] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {data.map((entry) => (
                                        <div
                                            key={entry.rank}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border transition-all",
                                                entry.isUser
                                                    ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                                    : "bg-slate-900/50 border-white/5 hover:bg-slate-800/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 flex items-center justify-center font-bold rounded-full text-sm shrink-0",
                                                    entry.rank === 1 ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/50" :
                                                        entry.rank === 2 ? "bg-slate-300 text-black shadow-lg shadow-slate-300/50" :
                                                            entry.rank === 3 ? "bg-amber-700 text-white shadow-lg shadow-amber-700/50" :
                                                                "bg-slate-800 text-slate-400"
                                                )}>
                                                    {entry.rank}
                                                </div>

                                                {/* AVATAR */}
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                                                    {entry.avatar && (
                                                        <img src={entry.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                    )}
                                                </div>

                                                <div className="flex flex-col overflow-hidden">
                                                    <span className={cn(
                                                        "font-bold text-sm truncate",
                                                        entry.isUser ? "text-blue-300" : "text-slate-200"
                                                    )}>
                                                        {entry.name || "Anonymous"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-mono truncate">
                                                        {entry.address}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="font-black text-xl tracking-tight text-white/90 whitespace-nowrap ml-2">
                                                {entry.score.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
