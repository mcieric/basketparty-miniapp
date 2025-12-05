"use client";
import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useBaseUserContext } from "./hooks/useBaseUserContext";
import { PlayerHeader } from "./components/PlayerHeader";
import { BasketGame } from "./components/BasketGame";

export default function Home() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const user = useBaseUserContext();

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 12,
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#f9fafb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <PlayerHeader user={user} />
        <BasketGame />
      </div>
    </main>
  );
}
