"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RaffleCard from "@/components/RaffleCard";
import RaffleCardSkeleton from "@/components/RaffleCardSkeleton";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { getRaffles } from "@/lib/prismaFunctions";
import type { Raffle } from "@/types/raffle";

type PageState = "loading" | "empty" | "error" | "success";

export default function Home() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");


  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        setPageState("loading");
        console.log("🔍 Fetching raffles...");
        const data = await getRaffles();
        console.log("✅ Data received:", data);

        if (!data || data.length === 0) {
          console.log("⚠️ No data returned");
          setPageState("empty");
          setRaffles([]);
        } else {
          console.log("🎉 Setting raffles:", data);
          setPageState("success");
          setRaffles(data as Raffle[]);
        }
      } catch (error) {
        console.error("❌ Error:", error);
        setPageState("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load raffles"
        );
      }
    };

    fetchRaffles();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };


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

      {/* Active Raffles Section */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-amber-400 tracking-wide">
          🎰 Live Raffles
        </h2>

        {/* LOADING STATE */}
        {pageState === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <RaffleCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* SUCCESS STATE */}
        {pageState === "success" && raffles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {raffles.map((raffle) => (
              <RaffleCard
                key={raffle.id}
                raffle={raffle}
                onClick={() => router.push(`/raffle/${raffle.id}`)}
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {pageState === "empty" && <EmptyState />}

        {/* ERROR STATE */}
        {pageState === "error" && (
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        )}
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
