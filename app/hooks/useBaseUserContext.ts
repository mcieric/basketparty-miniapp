"use client";

import { useAccount } from "wagmi";
import sdk from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";

export type BaseUserContext = {
  address: string | undefined;
  displayName: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
  type: "farcaster" | "wallet" | null;
};

export function useBaseUserContext(): BaseUserContext {
  const { address, isConnected } = useAccount();
  const [farcasterUser, setFarcasterUser] = useState<{
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    custodyAddress?: string;
    verifiedAddresses?: string[];
  } | null>(null);

  useEffect(() => {
    async function checkFarcaster() {
      try {
        const context = await sdk.context;
        if (context?.user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fcUser = context.user as any;
          setFarcasterUser({
            username: fcUser.username,
            displayName: fcUser.displayName,
            pfpUrl: fcUser.pfpUrl,
            custodyAddress: fcUser.custodyAddress,
            verifiedAddresses: fcUser.verifiedAddresses as string[],
          });
        }
      } catch (e) {
        console.warn("Farcaster SDK context skipped:", e);
      }
    }
    checkFarcaster();
  }, []); // Run once on mount

  // Resolve Identity
  // Priority: Farcaster > Connected Wallet

  if (farcasterUser) {
    // Prefer verified address, then custody address
    const fcAddress = farcasterUser.verifiedAddresses?.[0] || farcasterUser.custodyAddress;

    return {
      address: fcAddress,
      displayName: farcasterUser.displayName || farcasterUser.username || "Farcaster User",
      avatarUrl: farcasterUser.pfpUrl || null,
      isAuthenticated: !!fcAddress,
      type: "farcaster"
    };
  }

  // Fallback to Wagmi (Base App / Browser)
  return {
    address: address,
    displayName: address ? `${address.slice(0, 6)}...` : null,
    avatarUrl: null, // Wallet usually doesn't provide avatar immediately without ENS/Basename fetch
    isAuthenticated: isConnected && !!address,
    type: "wallet"
  };
}
