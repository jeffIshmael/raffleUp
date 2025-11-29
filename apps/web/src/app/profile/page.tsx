"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  getUserRaffleHistory,
  getUserProfileStats,
} from "@/lib/prismaFunctions";
import type { Ticket } from "@/types/raffle";
import { parseEther } from "viem";

interface UserStats {
  totalTickets: number;
  totalWagered: string;
  totalWinnings: string;
  ticketsWon: number;
  ticketsLost: number;
}

type ProfileState = "loading" | "error" | "success";
type TicketFilter = "all" | "active" | "won" | "lost";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pageState, setPageState] = useState<ProfileState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState<TicketFilter>("all");

  useEffect(() => {
    if (!isConnected || !address) {
      setPageState("error");
      setErrorMessage("Please connect your wallet");
      return;
    }

    const fetchData = async () => {
      try {
        setPageState("loading");
        const [ticketsData, statsData] = await Promise.all([
          getUserRaffleHistory(address),
          getUserProfileStats(address),
        ]);

        setTickets(ticketsData);
        setStats(statsData);
        setPageState("success");
      } catch (error) {
        setPageState("error");
        setErrorMessage("Failed to load profile data");
      }
    };

    fetchData();
  }, [address, isConnected]);

  const copyWallet = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });



  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-amber-400 mb-4">
            Wallet Connection Required
          </h1>
          <p className="text-gray-400">
            Please connect your wallet to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Wallet & Stats */}
      {pageState === "success" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {/* Wallet Card */}
          <div className="lg:col-span-2 border-2 border-amber-400 rounded p-6 bg-black bg-opacity-50">
            <p className="text-gray-400 text-sm mb-3">Connected Wallet</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-mono text-amber-400">
                {formatAddress(address!)}
              </p>
              <button
                onClick={copyWallet}
                className="text-amber-400 hover:text-amber-300 transition-colors"
                title="Copy wallet address"
              >
                {copied ? "✓" : "📋"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-mono">{address}</p>
          </div>

          {/* Total Tickets */}
          <div className="border-2 border-blue-500 border-opacity-30 rounded p-6 bg-black bg-opacity-50">
            <p className="text-gray-400 text-sm mb-2">Total Tickets</p>
            <p className="text-3xl font-bold text-blue-400">
              {stats.totalTickets}
            </p>
          </div>

          {/* Total Wagered */}
          <div className="border-2 border-amber-400 border-opacity-30 rounded p-6 bg-black bg-opacity-50">
            <p className="text-gray-400 text-sm mb-2">Total Wagered</p>
            <p className="text-3xl font-bold text-amber-400">
              {stats.totalWagered}
            </p>
            <p className="text-xs text-gray-500 mt-1">cUSD</p>
          </div>

          {/* Total Winnings */}
          <div className="border-2 border-green-500 border-opacity-30 rounded p-6 bg-black bg-opacity-50">
            <p className="text-gray-400 text-sm mb-2">Total Winnings</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.totalWinnings}
            </p>
            <p className="text-xs text-gray-500 mt-1">cUSD</p>
          </div>
        </div>
      )}

      {/* History Section */}
      <div>
        <h2 className="text-3xl font-bold text-amber-400 mb-6">
          📊 Ticket History
        </h2>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 border-b border-amber-400 border-opacity-20 overflow-x-auto pb-4">
          {(["all", "active", "won", "lost"] as TicketFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm capitalize ${
                filter === tab
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-gray-400 hover:text-amber-400"
              }`}
            >
              {tab === "all" && `All (${tickets.length})`}
              {tab === "active" &&
                `🎰 Active (${
                  tickets.filter((t) => t.status === "active").length
                })`}
              {tab === "won" &&
                `🎊 Won (${tickets.filter((t) => t.status === "won").length})`}
              {tab === "lost" &&
                `❌ Lost (${
                  tickets.filter((t) => t.status === "lost").length
                })`}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {pageState === "loading" && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-800 rounded animate-pulse"
              ></div>
            ))}
          </div>
        )}

        {pageState === "success" && filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">🎫</p>
            <p className="text-gray-400">
              {filter === "all" ? "No tickets yet" : `No ${filter} tickets`}
            </p>
          </div>
        )}

        {pageState === "success" && filteredTickets.length > 0 && (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={`${ticket.raffleId}-${ticket.id}`}
                className={`border-2 rounded p-6 transition-all duration-300 ${
                  ticket.status === "won"
                    ? "border-green-500 bg-green-500 bg-opacity-5 hover:border-green-400"
                    : ticket.status === "active"
                    ? "border-amber-400 border-opacity-40 bg-amber-400 bg-opacity-5 hover:border-opacity-60"
                    : "border-gray-600 border-opacity-40 bg-gray-600 bg-opacity-5"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                  {/* Raffle Name */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Raffle</p>
                    <p className="font-bold text-white">
                      {ticket.raffle.title}
                    </p>
                  </div>

                  {/* Selected Numbers */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Numbers</p>
                    <div className="flex flex-wrap gap-1">
                      {ticket.selectedNumbers.slice(0, 3).map((n) => (
                        <span
                          key={n}
                          className="bg-amber-400 text-black text-xs px-2 py-1 rounded font-bold"
                        >
                          {n}
                        </span>
                      ))}
                      {ticket.selectedNumbers.length > 3 && (
                        <span className="text-gray-400 text-xs px-2 py-1">
                          +{ticket.selectedNumbers.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Amount</p>
                    <p className="font-bold text-amber-400">
                      {ticket.amount} cUSD
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Date</p>
                    <p className="text-sm text-gray-300">
                      {new Date(ticket.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-bold capitalize ${
                        ticket.status === "won"
                          ? "bg-green-500 bg-opacity-20 text-green-400"
                          : ticket.status === "active"
                          ? "bg-amber-400 bg-opacity-20 text-amber-400"
                          : "bg-gray-600 bg-opacity-20 text-gray-400"
                      }`}
                    >
                      {ticket.status === "won" && "✨ Winner"}
                      {ticket.status === "active" && "🎰 Active"}
                      {ticket.status === "lost" && "❌ Lost"}
                    </span>
                  </div>

                  {/* Winnings (if won) */}
                  {ticket.status === "won" && ticket.winAmount && (
                    <div className="lg:col-span-6 mt-2 pt-2 border-t border-green-500 border-opacity-20">
                      <p className="text-green-400 font-bold">
                        🎉 Won: +{ticket.winAmount} cUSD
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {pageState === "error" && (
          <div className="text-center py-12 text-red-400">{errorMessage}</div>
        )}
      </div>
    </div>
  );
}
