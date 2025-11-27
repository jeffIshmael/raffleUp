'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import MobileNav from '../components/MobileNav';
import './globals.css';

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
        {/* Casino Pattern Background */}
        <div className="fixed inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, #D4AF37 0px, #D4AF37 2px, transparent 2px, transparent 8px),
              repeating-linear-gradient(-45deg, #D4AF37 0px, #D4AF37 2px, transparent 2px, transparent 8px)
            `,
          }}
        />
        
        <Navbar />
        <main className="relative z-10 pt-20 pb-24 md:pb-0">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}