import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import {Toaster} from "sonner"

import './globals.css';
import { WalletProvider } from "../components/wallet-provider"
import Navbar from "../components/navbar";
import MobileNav from '../components/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'raffle-up',
  description: 'Raffle Up lets users pick lucky numbers, enter raffles with cUSD, and win transparent, on-chain prizes — all powered by Celo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>RaffleUp - Celo Raffle dApp</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-black text-white overflow-x-hidden">
        <WalletProvider>
          {/* Casino Pattern Background */}
          <div className="fixed inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, #D4AF37 2px, #D4AF37 4px, transparent 4px, transparent 10px),
                repeating-linear-gradient(-45deg, #D4AF37 2px, #D4AF37 4px, transparent 4px, transparent 10px)
              `,
            }}
          />
          
          <Navbar />
          <main className="relative z-10 pt-20 pb-24 md:pb-0">{children}</main>
          <MobileNav />
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}