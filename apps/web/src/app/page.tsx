"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RaffleCard from "../components/RaffleCard";
// import Timer from '@/components/Timer';
import { MOCK_RAFFLES } from "../utils/constants";
import { useWriteContract, useAccount } from "wagmi";

export default function HomePage() {
  const router = useRouter();
  const {writeContractAsync} = useWriteContract();
  const {isConnected, address} = useAccount();

  // const sendcUSD = async() =>{
  //   try {
  //     if(!address){
  //       console.error("not connected");
  //       return;
  //     }

  //     const amount = parseEther("0.1");
  //     const usedAddress = "0xE645d2C1C3d665Ac84BFDe272DaE11c81bA0dbF6" as `0x${string}`
  //     console.log("sending...")

  //     const hash = await writeContractAsync({
  //       address: cUSDAddress,
  //       abi: erc20Abi,
  //       functionName: "transfer",
  //       args:["0xE645d2C1C3d665Ac84BFDe272DaE11c81bA0dbF6", amount]
  //     })

  //     if(!hash){
  //       console.error("error done.")
  //     }
      
  //   } catch (error) {
  //     console.error(error);
      
  //   }
  // }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="relative mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="text-white">RAFFLE</span>
            <span className="text-amber-400 ml-3">UP</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light">
            Put Your Luck to the Test.
          </p>
        </div>

        <div
          className="inline-block border-2 border-amber-400 px-8 py-4 rounded-lg
          shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <p className="text-gray-200">
            Pick your lucky numbers, enter the draw, and watch the winnings roll
            in.
          </p>
        </div>
      </section>

      {/* Active Raffles */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-amber-400 tracking-wide">
          🎰 Live Raffles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_RAFFLES.map((raffle) => (
            <RaffleCard
              key={raffle.id}
              raffle={raffle}
              onClick={() => router.push(`/raffle/${raffle.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <section className="mt-20 pt-12 border-t border-amber-400 border-opacity-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-sm text-gray-400">
          <div>
            <p className="font-semibold text-amber-400 mb-2">🔒 Secure</p>
            <p>Secured by audited smart contracts on the Celo blockchain.</p>
          </div>
          <div>
            <p className="font-semibold text-amber-400 mb-2">⚡ Fast</p>
            <p>
              Instant entries, real-time confirmations, and fully transparent
              draws.
            </p>
          </div>
          <div>
            <p className="font-semibold text-amber-400 mb-2">💰 Rewarding</p>
            <p>Real prizes. Real winners. Real earnings.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
