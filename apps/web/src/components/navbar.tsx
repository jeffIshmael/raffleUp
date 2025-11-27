'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block bg-black bg-opacity-90
      backdrop-blur-md border-b border-amber-400 border-opacity-20"
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-wider">
          <span className="text-white">RAFFLE</span>
          <span className="text-amber-400 ml-2">UP</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            href="/#raffles"
            className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            Raffles
          </Link>
          <Link
            href="/winners"
            className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            Winners
          </Link>
          <Link
            href="/profile"
            className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            Profile
          </Link>
        </div>

        {/* Wallet Button */}
        <button
          onClick={() => setWalletConnected(!walletConnected)}
          className={`px-6 py-2 rounded font-semibold transition-all duration-300
            border-2 ${
              walletConnected
                ? 'bg-amber-400 text-black border-amber-400 hover:bg-amber-300'
                : 'border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black'
            }`}
        >
          {walletConnected ? '✓ Connected' : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}