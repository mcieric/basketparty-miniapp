"use client";
import { useEffect, useState } from "react";
// import { useMiniKit } from "@coinbase/onchainkit/minikit";
import sdk from "@farcaster/miniapp-sdk";
import { useBaseUserContext } from "./hooks/useBaseUserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { BasketGame } from "@/components/BasketGame";
import { Loader2, Trophy, Coins } from "lucide-react";

import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction
} from "@coinbase/onchainkit/transaction";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { Leaderboard } from "@/components/Leaderboard";
import { WalletSelector } from "@/components/WalletSelector";

export default function Home() {
  // const { isFrameReady, setFrameReady } = useMiniKit();
  const [, setFrameReady] = useState(false);
  const user = useBaseUserContext();
  const [gameState, setGameState] = useState<"menu" | "loading" | "playing" | "payment" | "gameover">("menu");
  const [sessionData, setSessionData] = useState<{ gameId?: string, error?: string } | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    // Initialize SDK
    const init = async () => {
      await sdk.actions.ready();
      setFrameReady(true);
    };
    init();
  }, []);

  // 1. Try to Start Game (Check Free Quota)
  const handleStartRequest = async () => {
    setGameState("loading");
    try {
      const res = await fetch("/api/game/start", {
        method: "POST",
        body: JSON.stringify({ address: user.address }),
      });
      const data = await res.json();

      if (data.success) {
        setSessionData({ gameId: data.game_id });
        setGameState("playing");
      } else if (data.requires_payment) {
        setGameState("payment");
      } else {
        alert("Erreur: " + data.error);
        setGameState("menu");
      }
    } catch (e) {
      console.error(e);
      setGameState("menu");
    }
  };

  // 2. Handle Payment Success (Called by OnchainKit)
  const handlePaymentSuccess = async () => {
    setGameState("loading");
    try {
      // Notify backend of payment (in real app verify tx hash)
      const res = await fetch("/api/game/start", {
        method: "POST",
        body: JSON.stringify({ address: user.address, mock_payment: true }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionData({ gameId: data.game_id });
        setGameState("playing");
      }
    } catch (e) {
      console.error(e);
      setGameState("menu");
    }
  };

  // 3. Handle End Game
  const handleGameOver = async (score: number) => {
    setLastScore(score);
    if (sessionData?.gameId) {
      // Optimistic update
      setGameState("gameover");
      try {
        await fetch("/api/game/end", {
          method: "POST",
          body: JSON.stringify({
            address: user.address,
            score,
            game_id: sessionData.gameId
          }),
        });
        // Update local high score logic here if needed
      } catch (e) { console.error(e); }
    } else {
      setGameState("gameover");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-x-hidden bg-slate-950 font-sans selection:bg-blue-500/30">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-50" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

      {/* TITLE LOGO */}
      {/* LEADERBOARD OVERLAY */}
      <Leaderboard open={showLeaderboard} onOpenChange={setShowLeaderboard} />

      <AnimatePresence mode="wait">
        {gameState === "menu" && (
          <>
            {/* TITLE LOGO - Outside Card */}
            <motion.div
              key="menu-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="z-10 w-full max-w-2xl px-6 mb-8"
            >
              <div className="text-center relative group cursor-default">
                {/* Main Title Container */}
                <div className="relative inline-block">
                  {/* Glow Background */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Title */}
                  <motion.div
                    animate={{
                      textShadow: [
                        "0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(168,85,247,0.3)",
                        "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(59,130,246,0.3)",
                        "0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(168,85,247,0.3)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative"
                  >
                    <h1 className="text-7xl md:text-8xl font-black tracking-tight relative">
                      {/* BASKET */}
                      <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 drop-shadow-[0_0_25px_rgba(59,130,246,0.8)]">
                        BASKET
                      </span>
                      {/* Separator */}
                      <span className="inline-block mx-3 text-blue-400 opacity-50">•</span>
                      {/* PARTY */}
                      <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]">
                        PARTY
                      </span>
                    </h1>

                    {/* Underline Accent */}
                    <motion.div
                      animate={{
                        scaleX: [0.8, 1, 0.8],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-1 mt-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                    />
                  </motion.div>

                  {/* Corner Accents */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-400 opacity-60" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-pink-400 opacity-60" />
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-purple-400 opacity-60" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-fuchsia-400 opacity-60" />
                </div>

                {/* Subtitle Badge */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-400/30 backdrop-blur-md"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                  <p className="text-blue-200 font-mono text-sm tracking-[0.25em] uppercase font-bold">
                    Daily Free Shot
                  </p>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                </motion.div>
              </div>
            </motion.div>

            {/* MAIN CARD */}
            <motion.div
              key="menu-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="z-10 w-full max-w-md px-6"
            >
              <div className="relative group perspective-1000">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <Card className="relative border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-2xl p-6 rounded-2xl ring-1 ring-white/10">
                  {/* SCANLINES EFFECT */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none opacity-50" />

                  <div className="space-y-6 relative z-10">
                    {/* WALLET CONNECTION */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-full">
                        {!user.address ? (
                          <WalletSelector />
                        ) : (
                          <Wallet>
                            <ConnectWallet className="w-full bg-slate-950/50 hover:bg-slate-900 border-white/5 text-white transition-all duration-300 group/wallet">
                              <Avatar className="h-6 w-6 ring-2 ring-white/10" />
                              <Name className="font-bold text-blue-100 group-hover/wallet:text-white transition-colors" />
                            </ConnectWallet>
                            <WalletDropdown>
                              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                <Avatar />
                                <Name />
                                <Address />
                              </Identity>
                              <WalletDropdownDisconnect />
                            </WalletDropdown>
                          </Wallet>
                        )}
                      </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 text-center group/stat hover:border-white/10 transition-colors">
                        <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-wider">High Score</div>
                        <div className="text-2xl font-black text-white flex items-center justify-center gap-2 group-hover/stat:scale-110 transition-transform">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          0
                        </div>
                      </div>
                      <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 text-center group/stat hover:border-white/10 transition-colors">
                        <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-wider">Credits</div>
                        <div className="text-2xl font-black text-white flex items-center justify-center gap-2 group-hover/stat:scale-110 transition-transform">
                          <Coins className="w-4 h-4 text-blue-400" />
                          ∞
                        </div>
                      </div>
                    </div>

                    {/* PLAY BUTTON */}
                    <Button
                      size="lg"
                      onClick={handleStartRequest}
                      className="w-full h-16 text-xl font-black italic tracking-wide bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 border-0 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group/btn rounded-xl"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite] pointer-events-none" />
                      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
                        JOUER
                        <span className="text-xs font-bold not-italic bg-black/30 px-2 py-0.5 rounded-full text-blue-200 border border-white/10">Gratuit</span>
                      </span>
                    </Button>

                    {/* LEADERBOARD BUTTON */}
                    <Button
                      variant="ghost"
                      onClick={() => setShowLeaderboard(true)}
                      className="w-full text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all rounded-xl h-10 text-xs font-bold tracking-wider uppercase"
                    >
                      <Trophy className="w-3 h-3 mr-2" />
                      Voir le classement
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        {/* LOADING */}
        {gameState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 z-10"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
            </div>
            <p className="text-sm font-mono text-blue-200/50 animate-pulse uppercase tracking-widest">Initialisation...</p>
          </motion.div>
        )
        }

        {/* PAYMENT REQUEST */}
        {
          gameState === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="z-10 w-full max-w-md px-6"
            >
              <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl p-8 space-y-6 text-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
                <div className="bg-yellow-500/10 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-2 ring-1 ring-yellow-500/20">
                  <Coins className="w-10 h-10 text-yellow-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white">QUOTA GRATUIT ÉPUISÉ</h2>
                  <p className="text-slate-400 text-sm">
                    Vous avez déjà joué votre partie gratuite aujourd&apos;hui.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Transaction
                    chainId={8453}
                    calls={[
                      {
                        to: "0xb7A0266F0E0559957B77443E090F104383cAF16F",
                        functionName: "play",
                        abi: [{
                          inputs: [],
                          name: "play",
                          outputs: [],
                          stateMutability: "nonpayable",
                          type: "function"
                        }]
                      }
                    ]}
                    onStatus={(status) => {
                      console.log("Tx Status:", status);
                      if (status.statusName === 'success') {
                        handlePaymentSuccess();
                      }
                    }}
                  >
                    <TransactionButton text="PAYER 0.1 USDC" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20" />
                    <TransactionSponsor />
                    <TransactionStatus>
                      <TransactionStatusLabel />
                      <TransactionStatusAction />
                    </TransactionStatus>
                  </Transaction>

                  <Button
                    variant="ghost"
                    onClick={() => setGameState("menu")}
                    className="w-full hover:bg-white/5 text-slate-400 hover:text-white"
                  >
                    Annuler
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        }

        {/* GAME PLAYING */}
        {
          gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <BasketGame onGameOver={handleGameOver} />
              <Button
                variant="ghost"
                className="mt-8 text-white/30 hover:text-white hover:bg-white/5 backdrop-blur-md transition-all uppercase tracking-widest text-xs font-bold"
                onClick={() => setGameState("menu")}
              >
                Abandonner
              </Button>
            </motion.div>
          )
        }

        {/* GAME OVER */}
        {
          gameState === "gameover" && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center z-10 w-full max-w-sm px-6"
            >
              <Card className="bg-slate-900/90 border-slate-800 p-8 min-w-[300px] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none" />
                <h2 className="text-3xl font-black italic text-white mb-2 tracking-tighter relative z-10">GAME OVER</h2>
                <div className="relative py-8">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-500/20 blur-3xl rounded-full" />
                  <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500 mb-2 drop-shadow-sm transform scale-100 group-hover:scale-110 transition-transform duration-500 relative z-10">
                    {lastScore}
                  </div>
                  <div className="text-xs font-mono text-yellow-500/50 uppercase tracking-[0.3em] relative z-10">Points</div>
                </div>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  <Button
                    variant="outline"
                    onClick={() => setGameState("menu")}
                    className="w-full h-12 border-slate-700 hover:bg-slate-800/80 text-slate-300"
                  >
                    MENU
                  </Button>
                  <Button
                    onClick={handleStartRequest}
                    className="w-full h-12 font-bold bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/10"
                  >
                    REJOUER
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        }
      </AnimatePresence >
    </main >
  );
}
