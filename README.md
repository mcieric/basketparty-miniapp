# 🏀 Basket Party

**Basket Party** is a competitive basketball mini-app on Farcaster & Base. Shoot hoops, win glory, and climb the global leaderboard!

![Basket Party Banner](https://basketparty-miniapp.vercel.app/hero.png)

## 🎮 Overview

Basket Party brings arcade-style basketball to the Farcaster ecosystem. Players get **one free shot per day** to set their high score. Want more chances? Pay a small fee in **USDC** on Base to keep playing and climbing the ranks.

> [!NOTE]
> This app demonstrates advanced Farcaster Mini-App capabilities including on-chain payments, frame interaction, and cryptographic score verification.

## ✨ Features

- **Daily Free Quota**: Every player gets 1 free game per day (reset at midnight UTC).
- **On-Chain Payments**: Seamless integration with **Base Mainnet** (Native USDC) for paid games.
- **Secure Leaderboard**: Scores are secured via **Wallet Signatures (SIWE)** to prevent spoofing.
- **Global Rankings**: Persistent All-Time and Weekly leaderboards powered by Redis.
- **Vibrant UI**: Built with Framer Motion for juicy animations and a premium dark-mode aesthetic.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Blockchain**: [OnchainKit](https://onchainkit.xyz/), [Wagmi](https://wagmi.sh/), & [Viem](https://viem.sh/)
- **Storage**: [Upstash Redis](https://upstash.com/) (Leaderboards & Quotas)
- **Platform**: [Farcaster Mini-App SDK](https://github.com/farcasterxyz/miniapp-sdk)

## 🚀 Getting Started

### Prerequisites

1.  **Node.js 18+**
2.  **Redis Database** (e.g., Upstash)
3.  **Coinbase Developer Platform (CDP) API Key**

### 1. Installation

```bash
git clone https://github.com/mcieric/basketparty-miniapp.git
cd basketparty-miniapp
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_api_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 3. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to play!

## 🔒 Security

To ensure fair play, **Basket Party** uses cryptographic signatures. When a game ends:
1.  The frontend requests the user to **sign a message** containing their `GameID` and `Score`.
2.  The backend verifies this signature using `viem` before recording the score.
3.  Unsigned or invalid attempts are rejected.

## 📦 Deployment

Deploy easily to Vercel:

```bash
vercel --prod
```

Don't forget to set your Environment Variables in the Vercel dashboard!

---

Built with ❤️ for the Base & Farcaster community.
