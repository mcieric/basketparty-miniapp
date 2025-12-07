import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BasketParty Mini-App",
  description: "Play BasketParty on Farcaster",
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://basketparty-miniapp.vercel.app/hero.png",
      buttonTitle: "Play BasketParty",
      splashImageUrl: "https://basketparty-miniapp.vercel.app/splash.png",
      splashBackgroundColor: "#0f172a",
    })
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, sourceCodePro.className, "dark")}>
        <Providers>
          <div className="relative min-h-screen bg-background font-sans antialiased">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
