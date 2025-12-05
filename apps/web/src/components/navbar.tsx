"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "./connect-button";
import { cUSDAddress } from "../Constants/constants";
import Image from "next/image";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  const { address, isConnected } = useAccount();
  const pathname = usePathname();

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

    if (
      address.toLowerCase() ===
      "0x4821ced48fb4456055c86e42587f61c1f39c6315".toLowerCase()
    ) {
      setIsAdmin(true);
    }
  }, [address]);

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const navLinkClasses = (path: string) =>
    `nav-link transition-colors pb-1 border-b-2 ${
      isActive(path)
        ? "text-amber-400 border-amber-400"
        : "text-gray-300 border-transparent hover:text-amber-400"
    }`;

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
          <Link href="/" className="text-2xl font-bold tracking-wider flex items-center gap-2">
            <Image
              src="/images/raffleup.jpg"
              alt="RaffleUp"
              width={50}
              height={50}
              className="rounded-2xl w-16 h-16"
            />
            <span className="text-white">RAFFLE</span>
            <span className="text-amber-400 ml-2">UP</span>
          </Link>

          {/* Nav Links */}
          {isConnected && (
            <div className="flex items-center gap-8">
              <Link href="/" className={navLinkClasses("/")}>
                Home
              </Link>
              <Link href="/winners" className={navLinkClasses("/winners")}>
                Past Draws
              </Link>
              <Link
                href="/my-tickets"
                className={navLinkClasses("/my-tickets")}
              >
                My Tickets
              </Link>
              <Link href="/profile" className={navLinkClasses("/profile")}>
                My History
              </Link>
              {isAdmin && (
                <Link href="/admin" className={navLinkClasses("/admin")}>
                  Admin
                </Link>
              )}
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
        border-b border-amber-400 border-opacity-20 px-4 py-4
        flex items-center justify-between"
      >
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-wider">
          <span className="text-white">RAFFLE</span>
          <span className="text-amber-400 ml-1">UP</span>
        </Link>

        {/* Wallet Balance + Button */}
        <div className="flex items-center gap-3">
          {isConnected && (
            <span className="text-amber-400 text-md font-semibold">
              {walletBalance} cUSD
            </span>
          )}
          <ConnectButton />
        </div>
      </nav>
    </>
  );
}
