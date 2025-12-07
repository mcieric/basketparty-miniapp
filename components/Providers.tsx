"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import '@coinbase/onchainkit/styles.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia } from "wagmi/chains";
import { http, createConfig, WagmiProvider } from "wagmi";
import { type ReactNode, useState } from "react";
import { coinbaseWallet, injected } from 'wagmi/connectors';

const config = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(),
    },
    connectors: [
        injected(),
        coinbaseWallet({
            appName: 'BasketParty',
        })
    ]
});

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <div suppressHydrationWarning>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <OnchainKitProvider
                        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || "public_placeholder_key"}
                        chain={baseSepolia}
                    >
                        {children}

                    </OnchainKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </div>
    );
}
