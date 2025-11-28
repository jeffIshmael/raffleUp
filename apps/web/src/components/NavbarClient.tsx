'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from './connect-button';
import { cUSDAddress } from '../Constants/constants';

export default function NavbarClient() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { address, isConnected } = useAccount();

  // Fetch cUSD wallet balance
  const { data: balanceData } = useBalance({
    address: address,
    chainId: 11142220,
    token: cUSDAddress,
  });

  const walletBalance = balanceData?.formatted
    ? parseFloat(balanceData.formatted).toFixed(2)
    : '0.00';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!address) return;

    if (
      address.toLowerCase() ===
      '0x4821ced48fb4456055c86e42587f61c1f39c6315'.toLowerCase()
    ) {
      setIsAdmin(true);
    }
  }, [address]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Nav Links */}
      {isConnected && (
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            href="/winners"
            className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            Past Draws
          </Link>
          <Link
            href="/profile"
            className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
          >
            My History
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
            >
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
    </>
  );
}
