"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation, AnimatePresence, Variants } from "framer-motion";
import confetti from "canvas-confetti";


const GAME_WIDTH = 350;
const GAME_HEIGHT = 600;
const BASKET_Y = 80;
const SPAWN_Y = 480;

export function BasketGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [ballsLeft, setBallsLeft] = useState(5);
    const [ballState, setBallState] = useState<"idle" | "flying" | "scored" | "missed">("idle");
    const [basketX, setBasketX] = useState(GAME_WIDTH / 2);
    const [feedback, setFeedback] = useState<{ text: string, color: string } | null>(null);

    // Refs
    const requestRef = useRef<number>(0);
    const basketDirection = useRef(1);
    const basketSpeed = useRef(2);
    const baseSpeed = useRef(2); // New ref for base difficulty speed

    // Controls
    const ballControls = useAnimation();
    const netControls = useAnimation();
    const containerControls = useAnimation();

    // Loop
    const animateBasket = useCallback(() => {
        // Pause basket while ball is flying/scoring
        if (ballState !== "idle") {
            requestRef.current = requestAnimationFrame(animateBasket);
            return;
        }

        setBasketX((prev) => {
            const next = prev + basketSpeed.current * basketDirection.current;
            // Bounds
            if (next > GAME_WIDTH - 60 || next < 60) {
                basketDirection.current *= -1;
                // Randomize speed on wall hit: 0.8x to 2.3x of base speed
                basketSpeed.current = baseSpeed.current * (0.8 + Math.random() * 1.5);
            }
            return next;
        });
        requestRef.current = requestAnimationFrame(animateBasket);
    }, [ballState]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animateBasket);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [animateBasket]);

    useEffect(() => {
        // Difficulty scaling
        baseSpeed.current = 2.5 + Math.floor(score / 30) * 0.8;
        // Also update current speed if it's too slow to avoid getting stuck in slow motion
        if (basketSpeed.current < baseSpeed.current * 0.5) {
            basketSpeed.current = baseSpeed.current;
        }
    }, [score]);

    const showFeedback = (text: string, color: string) => {
        setFeedback({ text, color });
        setTimeout(() => setFeedback(null), 1000);
    };

    const handleShoot = async () => {
        if (ballState !== "idle" || ballsLeft <= 0) return;
        setBallsLeft(prev => prev - 1);
        setBallState("flying");

        // Calculate collision immediately
        const diff = Math.abs(basketX - (GAME_WIDTH / 2));
        // Logic: < 45 is a hit (Swish). 45-65 is a rim hit (Brick). > 65 is an airball.

        let points = 0;

        // Animate
        const duration = 0.5;

        await ballControls.start({
            y: BASKET_Y,
            scale: 0.5,
            transition: { duration, ease: [0.2, 0.8, 0.2, 1] }
        });

        if (diff < 45) {
            // GOAL
            points = 10 + (combo * 2);
            setScore(s => s + points);
            setCombo(c => c + 1);
            showFeedback(combo > 1 ? `COMBO x${combo}!` : "SWISH!", "text-green-400");
            setBallState("scored");

            // Screen Shake on combo
            if (combo > 0) {
                containerControls.start({
                    x: [0, -5, 5, -5, 5, 0],
                    transition: { duration: 0.2 }
                });
            }

            confetti({
                particleCount: 30 * (Math.min(combo + 1, 5)),
                spread: 50,
                origin: { y: 0.3 },
                colors: ['#34D399', '#FBBF24']
            });

            // Net ripple effect (Animation Variant Trigger)
            netControls.start("swish");

            // Ball drops through net
            await ballControls.start({
                y: BASKET_Y + 120,
                opacity: 0,
                scale: 0.4,
                transition: { duration: 0.25, ease: "easeIn" }
            });

        } else if (diff < 65) {
            // RIM HIT (Near miss)
            setCombo(0);
            setBallState("missed");
            showFeedback("BRICK", "text-orange-500");

            // Bounce off rim
            const bounceDirection = (basketX > GAME_WIDTH / 2 ? -1 : 1);

            // Screen Shake (small)
            containerControls.start({
                x: [0, -2, 2, 0],
                transition: { duration: 0.1 }
            });

            await ballControls.start({
                x: bounceDirection * 80 + (Math.random() * 40 - 20),
                y: BASKET_Y - 50, // Slight pop up
                rotate: 45 * bounceDirection,
                transition: { duration: 0.1, ease: "easeOut" }
            });
            await ballControls.start({
                y: GAME_HEIGHT + 100,
                rotate: 200 * bounceDirection,
                transition: { duration: 0.4, ease: "easeIn" }
            });

        } else {
            // AIRBALL (Clean miss)
            setCombo(0);
            setBallState("missed");
            showFeedback("AIRBALL", "text-red-500");

            // Random bounce
            await ballControls.start({
                x: (Math.random() > 0.5 ? 1 : -1) * 150,
                y: GAME_HEIGHT + 100,
                rotate: 200,
                transition: { duration: 0.5 }
            });
        }

        // Reset
        if (ballsLeft > 1) {
            setTimeout(() => {
                setBallState("idle");
                ballControls.set({ y: SPAWN_Y, x: 0, scale: 1, opacity: 1, rotate: 0 });
            }, 500);
        } else {
            // Game Over
            setTimeout(() => onGameOver(score + (diff < 45 ? points : 0)), 500);
        }
    };

    const netVariants: Variants = {
        idle: { scaleY: 1, skewX: 0 },
        swish: {
            scaleY: [1, 1.3, 0.9, 1],
            skewX: [0, -5, 5, 0],
            originY: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            animate={containerControls}
            className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950 font-sans select-none"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >

            {/* AMBIENCE BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />

            {/* Animated Particles/Stars (Simplified) */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute w-1 h-1 bg-white rounded-full top-10 left-20 animate-pulse" />
                <div className="absolute w-1 h-1 bg-white rounded-full top-40 right-10 animate-pulse delay-75" />
                <div className="absolute w-1 h-1 bg-white rounded-full bottom-20 left-10 animate-pulse delay-150" />
            </div>


            {/* PERSPECTIVE GRID FLOOR */}
            <div className="absolute bottom-0 w-full h-1/2 opacity-20"
                style={{
                    background: "linear-gradient(transparent 0%, #3b82f6 100%)",
                    transform: "perspective(500px) rotateX(60deg) scale(2)"
                }}
            />

            {/* UI HEADER */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-start z-30 bg-gradient-to-b from-black/80 to-transparent">
                <motion.div
                    key={score}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.1 }}
                    className="bg-slate-800/80 backdrop-blur border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center"
                >
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Score</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 font-mono">
                        {score}
                    </span>
                </motion.div>

                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        // Show filled for remaining, empty/ghost for used
                        <div key={i} className={`w-4 h-4 rounded-full border transition-all duration-300 ${i < ballsLeft
                            ? "bg-orange-500 border-orange-300 shadow shadow-orange-500/50 scale-100"
                            : "bg-slate-800 border-slate-700 scale-75 opacity-50"
                            }`} />
                    ))}
                </div>
            </div>

            {/* FEEDBACK OVERLAY */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        key={feedback.text}
                        initial={{ opacity: 0, y: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, y: -50, scale: 1.5, rotate: 0 }}
                        exit={{ opacity: 0, scale: 2 }}
                        className={`absolute top-1/2 left-0 right-0 text-center z-40 font-black text-4xl ${feedback.color} drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]`}
                        style={{ textShadow: '0 0 20px currentColor' }}
                    >
                        {feedback.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BASKET COMPONENT */}
            <motion.div
                className="absolute top-16 z-20 flex flex-col items-center"
                style={{ x: basketX - 55 }} // Centering: width/2 roughly
            >
                {/* Backboard */}
                <div className="w-28 h-20 bg-slate-800/90 border-2 border-white/50 rounded-lg relative shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden">
                    <div className="absolute inset-0 border-4 border-blue-500/50 rounded-md" />
                    <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-10 h-8 border-2 border-white/80" />
                </div>

                {/* Rim Connector */}
                <div className="w-4 h-4 bg-orange-700 -mt-2 z-10" />

                {/* Rim & Net */}
                <div className="relative flex flex-col items-center -mt-1">
                    {/* Front Rim */}
                    <div className="w-20 h-3 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 rounded-full z-20 shadow-lg" />

                    {/* Net (Animated) */}
                    <motion.div
                        variants={netVariants}
                        initial="idle"
                        animate={netControls}
                        className="w-16 h-12 relative z-10 opacity-80 origin-top"
                        style={{
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, #eee 4px, #eee 5px), repeating-linear-gradient(-45deg, transparent, transparent 4px, #eee 4px, #eee 5px)',
                            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                            clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)'
                        }}
                    />
                </div>
            </motion.div>

            {/* CLICK ZONE */}
            <div
                className="absolute bottom-0 w-full h-40 z-30 cursor-pointer"
                onClick={handleShoot}
            />

            {/* AURA (Visual Only) */}
            {ballState === "idle" && (
                <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <div className="w-24 h-24 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
                    <div className="absolute top-28 text-xs text-blue-300/80 tracking-widest animate-bounce font-bold">
                        TAP TO SHOOT
                    </div>
                </div>
            )}

            {/* THE BALL (Positioned Absolutely from Top) */}
            <motion.div
                animate={ballControls}
                initial={{ y: SPAWN_Y }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-0 right-0 mx-auto w-20 h-20 z-20 pointer-events-none"
                style={{ top: 0 }}
            >
                <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,_#fcd34d,_#fb923c,_#ef4444)] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.4),0_0_25px_rgba(251,146,60,0.8)] relative overflow-hidden group">
                    {/* Ball Texture Lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-60 mix-blend-multiply" viewBox="0 0 100 100">
                        <path d="M0,50 Q50,0 100,50" fill="none" stroke="#431407" strokeWidth="3" />
                        <path d="M50,0 L50,100" fill="none" stroke="#431407" strokeWidth="3" />
                        <circle cx="50" cy="50" r="48" fill="none" stroke="#431407" strokeWidth="3" />
                    </svg>
                    {/* Shine */}
                    <div className="absolute top-2 left-2 w-8 h-4 bg-white/30 blur-md rounded-full -rotate-45" />
                </div>
            </motion.div>
        </motion.div>
    );
}
