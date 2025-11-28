"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useConnect, useAccount, useDisconnect } from "wagmi";

export function ConnectButton() {
  const [isMinipay, setIsMinipay] = useState(false);
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // @ts-ignore
    if (window.ethereum?.isMiniPay) {
      setIsMinipay(true);
    }
  }, []);

  if (isMinipay) {
    return null;
  }

  const connectWallet = async () => {
    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (isConnected) disconnect();
          else connectWallet();
        }}
        onMouseEnter={(e) => {
          if (isConnected) e.currentTarget.innerText = "Disconnect ⛓️‍💥";
        }}
        onMouseLeave={(e) => {
          if (isConnected)
            e.currentTarget.innerText =
              address?.slice(0, 6) + "..." + address?.slice(-4);
        }}
        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 border-2 ${
          isConnected
            ? "bg-amber-400 text-black border-amber-400 hover:bg-amber-300"
            : "border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
        }`}
      >
        {isConnected
          ? `${address?.slice(0, 6) + "..." + address?.slice(-4)}`
          : "Connect Wallet"}
      </button>
    </>
  );
}
