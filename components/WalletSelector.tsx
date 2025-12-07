"use client";

import { useState, useEffect } from "react";
import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ArrowRight } from "lucide-react";

export function WalletSelector() {
    const [open, setOpen] = useState(false);
    const { connectors, connect } = useConnect();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleConnect = (walletType: "coinbase" | "rabby" | "metamask") => {
        let targetConnector;

        if (walletType === "coinbase") {
            targetConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');
        } else if (walletType === "rabby") {
            // EIP-6963 might list it as 'Rabby' name, or fall back to injected
            targetConnector = connectors.find(c => c.name.toLowerCase().includes('rabby'));
        } else if (walletType === "metamask") {
            // EIP-6963 or injected
            targetConnector = connectors.find(c => c.name.toLowerCase().includes('metamask'));
        }

        // Fallback for Rabby/MetaMask to generic 'injected' if specific not found but requested
        // This usually happens if they are not strictly EIP-6963 injected or just 'injected' generic
        if (!targetConnector && (walletType === 'rabby' || walletType === 'metamask')) {
            targetConnector = connectors.find(c => c.id === 'injected');
        }

        if (targetConnector) {
            connect({ connector: targetConnector });
            setOpen(false);
        } else {
            alert(`${walletType} connector not found. Please ensure it is installed.`);
        }
    };

    if (!mounted) return null;

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
            >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
            </Button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* BACKDROP */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />

                        {/* MODAL */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* HEADER */}
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                                <h2 className="text-lg font-black italic text-white">CHOOSE WALLET</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setOpen(false)}
                                    className="text-slate-400 hover:text-white h-8 w-8"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* CONTENT */}
                            <div className="p-4 space-y-3">
                                {/* BASE APP WALLET */}
                                <button
                                    onClick={() => handleConnect('coinbase')}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-600/10 border border-blue-600/30 hover:bg-blue-600/20 hover:border-blue-500 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                            <Wallet className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white text-sm">Base App Wallet</div>
                                            <div className="text-xs text-blue-300/70">Recommended</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </button>

                                {/* RABBY */}
                                <button
                                    onClick={() => handleConnect('rabby')}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#86909c] flex items-center justify-center shrink-0 overflow-hidden">
                                            {/* Placeholder for Rabby Logo - using generic or text */}
                                            <span className="font-bold text-white text-[10px]">RABBY</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white text-sm">Rabby Wallet</div>
                                            <div className="text-xs text-slate-400">Injected</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </button>

                                {/* METAMASK */}
                                <button
                                    onClick={() => handleConnect('metamask')}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#f6851b] flex items-center justify-center shrink-0 text-white font-bold text-[10px]">
                                            FOX
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white text-sm">MetaMask</div>
                                            <div className="text-xs text-slate-400">Injected</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
