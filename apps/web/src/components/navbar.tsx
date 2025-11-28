"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "./connect-button";
import { cUSDAddress } from "../Constants/constants";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  const { address, isConnected } = useAccount();

  // Fetch cUSD wallet balance 
  const { data: balanceData } = useBalance({
    address: address,
    chainId: 11142220, 
    token: cUSDAddress, 
  });


  const walletBalance = balanceData?.formatted
    ? parseFloat(balanceData.formatted).toFixed(2)
    : "0.00";

  useEffect(() => {
    if (!address) return;

    if (address.toLowerCase() === "0x4821ced48fb4456055c86e42587f61c1f39c6315".toLowerCase()) {
      setIsAdmin(true);
    }
  }, [address]);

  return (
    <>
      {/* DESKTOP NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 hidden md:block 
        bg-black bg-opacity-90 backdrop-blur-md 
        border-b border-amber-400 border-opacity-20"
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-wider">
            <span className="text-white">RAFFLE</span>
            <span className="text-amber-400 ml-2">UP</span>
          </Link>

          {/* Nav Links */}
          {isConnected && (
            <div className="flex items-center gap-8">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/winners" className="nav-link">Past Draws</Link>
              <Link href="/profile" className="nav-link">My History</Link>
              {isAdmin && <Link href="/admin" className="nav-link">Admin</Link>}
            </div>
          )}

          {/* Wallet Section */}
          <div className="flex items-center gap-4">
            {isConnected && (
              <span className="text-amber-400 font-semibold text-sm tracking-wide">
                {walletBalance} <span className="text-gray-400">cUSD</span>
              </span>
            )}
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 md:hidden 
        bg-black bg-opacity-90 backdrop-blur-md 
        border-b border-amber-400 border-opacity-20 px-4 py-3
        flex items-center justify-between"
      >

        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-wider">
          <span className="text-white">RAFFLE</span>
          <span className="text-amber-400 ml-1">UP</span>
        </Link>
      

        {/* Wallet Balance + Button */}
        <div className="flex items-center gap-3">
          {isConnected && (
            <span className="text-amber-400 text-sm font-semibold">
              {walletBalance} cUSD
            </span>
          )}
          <ConnectButton />
        </div>
      </nav>
    </>
  );
}

