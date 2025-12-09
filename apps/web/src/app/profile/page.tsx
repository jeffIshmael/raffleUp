"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  getUserRaffleHistory,
  getUserProfileStats,
} from "@/lib/prismaFunctions";
import { getWinnersFromContract } from "@/lib/agentFunctions";
import type { Ticket } from "@/types/raffle";

interface UserStats {
  totalTickets: number;
  totalWagered: string;
  totalWinnings: string;
  ticketsWon: number;
  ticketsLost: number;
}

interface EnhancedTicket extends Ticket {
  winningNumbers?: number[];
  winAmount?: string;
}

type ProfileState = "loading" | "error" | "success";
type TicketFilter = "all" | "active" | "won" | "lost";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [tickets, setTickets] = useState<EnhancedTicket[]>([]);
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

        // Enhance tickets with blockchain winner data
        const enhancedTickets = await Promise.all(
          ticketsData.map(async (ticket) => {
            const enhancedTicket: EnhancedTicket = { ...ticket };
            console.log("the extended tickets", enhancedTicket);

            // Only check ended raffles
            if (new Date(ticket.raffle.endDate) < new Date()) {
              try {
                // Get winners from blockchain
                const winners = await getWinnersFromContract(
                  ticket.raffle.blockchainId
                );

                if (winners && winners.length > 0) {
                  // Check if user's address is among winners
                  const userWin = winners.find(
                    (w) => w.address.toLowerCase() === address.toLowerCase()
                  );

                  if (userWin) {
                    // User won - check if any of their numbers match winning numbers
                    const matchingNumbers = ticket.selectedNumbers.filter(
                      (num) => userWin.numbers.includes(num)
                    );

                    if (matchingNumbers.length > 0) {
                      enhancedTicket.status = "won";
                      enhancedTicket.winningNumbers = userWin.numbers;
                      enhancedTicket.winAmount = (
                        Number(userWin.amount) / 1e18
                      ).toString();
                    } else {
                      enhancedTicket.status = "lost";
                      enhancedTicket.winningNumbers = userWin.numbers;
                    }
                  } else {
                    // User's address not in winners
                    enhancedTicket.status = "lost";
                    // Optionally show what numbers won
                    if (winners[0]) {
                      enhancedTicket.winningNumbers = winners[0].numbers;
                    }
                  }
                } else {
                  // No winners data from blockchain yet
                  enhancedTicket.status = "lost";
                }
              } catch (error) {
                console.error("Error checking winner status:", error);
                enhancedTicket.status = "lost";
              }
            }

            return enhancedTicket;
          })
        );
        // Sort tickets by purchase date in descending order (newest first)
        const sortedTickets = enhancedTickets.sort((a, b) => {
          const dateA = new Date(a.purchaseDate).getTime();
          const dateB = new Date(b.purchaseDate).getTime();
          return dateB - dateA;
        });

        setTickets(sortedTickets);

        // Recalculate stats based on enhanced tickets
        const wonTickets = enhancedTickets.filter((t) => t.status === "won");
        const totalWinnings = wonTickets.reduce(
          (sum, t) => sum + parseFloat(t.winAmount || "0"),
          0
        );

        setStats({
          ...statsData,
          ticketsWon: wonTickets.length,
          ticketsLost: enhancedTickets.filter((t) => t.status === "lost")
            .length,
          totalWinnings: totalWinnings.toFixed(4),
        });

        setPageState("success");
      } catch (error) {
        console.error("Fetch data error:", error);
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

  const formatEndsIn = (endDate: string | Date) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
  
    if (diff <= 0) return "Expired";
  
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
    return `${minutes} min left`;
  };
  

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
            <p className="text-xs text-gray-500 mt-2 font-mono break-all">
              {address}
            </p>
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
                `🟢 Active (${
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
                className={`relative border-2 rounded p-6 transition-all duration-300 ${
                  ticket.status === "won"
                    ? "border-green-400/20 bg-green-500 bg-opacity-5 hover:border-green-400"
                    : ticket.status === "active"
                    ? "border-amber-400 border-opacity-40 bg-amber-400 bg-opacity-5 hover:border-opacity-60"
                    : "border-gray-600 border-opacity-40 bg-gray-600 bg-opacity-5"
                }`}
              >
                <div className="space-y-4">
                  <div className="absolute right-4 top-4 text-right">
                    <p className="text-[10px] text-gray-400">
                      {ticket.status === "active" ? "Ends in" : "Ended"}
                    </p>

                    {ticket.status === "active" ? (
                      <p className="text-xs font-semibold text-yellow-200">
                        {formatEndsIn(new Date(ticket.raffle.endDate))}
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-gray-300">
                        {new Date(ticket.raffle.endDate).toLocaleString(
                          "en-US",
                          {
                            dateStyle:"medium",
                            timeStyle:"short",
                            hour12:false
                          }
                        )}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    {/* Raffle Name */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Raffle</p>
                      <p className="font-bold text-white">
                        {ticket.raffle.title}
                      </p>
                    </div>

                    {/* Selected Numbers */}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Your Numbers</p>
                      <div className="flex flex-wrap gap-1">
                        {ticket.selectedNumbers.slice(0, 5).map((n) => {
                          const isWinningNumber =
                            ticket.status === "won" &&
                            ticket.winningNumbers?.includes(n);
                          return (
                            <span
                              key={n}
                              className={`text-xs px-2 py-1 rounded font-bold ${
                                isWinningNumber
                                  ? "bg-green-500 text-white"
                                  : "bg-amber-400 text-black"
                              }`}
                            >
                              {n}
                            </span>
                          );
                        })}
                        {ticket.selectedNumbers.length > 5 && (
                          <span className="text-gray-400 text-xs px-2 py-1">
                            +{ticket.selectedNumbers.length - 5}
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
                        {ticket.status === "active" && "🟢 Active"}
                        {ticket.status === "lost" && "❌ Lost"}
                      </span>
                    </div>
                  </div>

                  {/* Winning Numbers Display */}
                  {ticket.status === "lost" &&
                    ticket.winningNumbers &&
                    ticket.winningNumbers.length > 0 && (
                      <div className="pt-3 border-t border-gray-600 border-opacity-30">
                        <p className="text-xs text-gray-400 mb-2">
                          Winning Numbers:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {ticket.winningNumbers.slice(0, 10).map((n) => (
                            <span
                              key={n}
                              className="bg-gray-600 bg-opacity-30 text-gray-300 text-xs px-2 py-1 rounded font-bold"
                            >
                              {n}
                            </span>
                          ))}
                          {ticket.winningNumbers.length > 10 && (
                            <span className="text-gray-400 text-xs px-2 py-1">
                              +{ticket.winningNumbers.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Winnings Display */}
                  {ticket.status === "won" && ticket.winAmount && (
                    <div className="pt-3 border-t border-green-300 border-opacity-20">
                      <div className="flex items-center justify-between">
                        <p className="text-green-400 font-semibold text-lg">
                          🎉 Won: +{ticket.winAmount} cUSD
                        </p>
                        {ticket.winningNumbers && (
                          <div className="flex flex-wrap gap-1 justify-end">
                            <span className="text-xs text-gray-400 mr-2">
                              Winning:
                            </span>
                            {ticket.winningNumbers.slice(0, 5).map((n) => (
                              <span
                                key={n}
                                className="bg-green-500 bg-opacity-20 text-green-400 text-xs px-2 py-1 rounded font-bold"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
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
