"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import TicketCard from "@/components/TicketCard";
import TicketCardSkeleton from "@/components/TicketCardSkeleton";
import { getUserTicketsByStatus } from "@/lib/prismaFunctions";
import MyTicketsEmpty from "@/components/MyTicketsEmpty";
import MyTicketsError from "@/components/MyTicketsError";
import type { Ticket } from "@/types/raffle";

type PageState = "loading" | "empty" | "error" | "success";
type TabType = "active" | "won" | "lost";

export default function MyTicketsPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("active");

  useEffect(() => {
    if (!isConnected || !address) {
      setPageState("error");
      setErrorMessage("Please connect your wallet to view your tickets");
      return;
    }

    const fetchTickets = async () => {
      try {
        setPageState("loading");
        const data = await getUserTicketsByStatus(address, "active");

        if (!data || data.length === 0) {
          setPageState("empty");
          setTickets([]);
        } else {
          setPageState("success");
          setTickets(data as Ticket[]);
        }
      } catch (error) {
        setPageState("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load tickets"
        );
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [address, isConnected]);

  const filteredTickets = tickets.filter(
    (ticket) => ticket.status === activeTab
  );
  const activeCount = tickets.filter((t) => t.status === "active").length;
  const wonCount = tickets.filter((t) => t.status === "won").length;
  const lostCount = tickets.filter((t) => t.status === "lost").length;

  const handleRetry = () => {
    window.location.reload();
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-amber-400 mb-4">
            Wallet Connection Required
          </h1>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to view your tickets.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-400 text-black font-bold rounded hover:bg-amber-300 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🎫</span>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400">
            My Tickets
          </h1>
        </div>
        <p className="text-gray-300 text-lg">
          View and manage your active raffle tickets
        </p>
      </div>

      {/* LOADING STATE */}
      {pageState === "loading" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <TicketCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* SUCCESS STATE */}
      {pageState === "success" && filteredTickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onBuyMore={() => router.push(`/raffle/${ticket.raffleId}`)}
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {pageState === "empty" && (
        <MyTicketsEmpty onNavigate={() => router.push("/")} />
      )}

      {/* NO TICKETS IN TAB */}
      {pageState === "success" &&
        filteredTickets.length === 0 &&
        tickets.length > 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎲</div>
            <h3 className="text-2xl font-bold text-amber-400 mb-2">
              No active Tickets
            </h3>
            <p className="text-gray-400 mb-8">
              You don't have any {activeTab} tickets yet.
            </p>
            {activeTab === "active" && (
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-amber-400 text-black font-bold rounded hover:bg-amber-300 transition-colors"
              >
                Browse Raffles
              </button>
            )}
          </div>
        )}

      {/* ERROR STATE */}
      {pageState === "error" && (
        <MyTicketsError message={errorMessage} onRetry={handleRetry} />
      )}
    </div>
  );
}
