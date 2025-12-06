"use client";

import { useAccount } from "wagmi";
// import { useMiniKit } from "@coinbase/onchainkit/minikit"; 
// Switching to manual SDK usage or just rely on Wallet for now to fix crash, 
// then implement SDK properly.
// Actually, I'll just use the wallet address for now to unblock.

export type BaseUserContext = {
  address: string | undefined;
  displayName: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
};

export function useBaseUserContext(): BaseUserContext {
  const { address, isConnected } = useAccount();

  // TODO: Integrate sdk.quickAuth.getToken() and user data properly
  // For now, fallback to wallet only to fix the crash
  const displayName = address ? `${address.slice(0, 6)}...` : null;
  const avatarUrl = null;

  return {
    address: address,
    displayName,
    avatarUrl,
    isAuthenticated: isConnected && !!address
  };
}
