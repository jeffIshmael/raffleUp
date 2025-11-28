'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from './connect-button';
import { cUSDAddress } from '../Constants/constants';

export default function NavbarMobileClient() {
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

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {isConnected && (
        <span className="text-amber-400 text-sm font-semibold">
          {walletBalance} cUSD
        </span>
      )}
      <ConnectButton />
    </div>
  );
}
