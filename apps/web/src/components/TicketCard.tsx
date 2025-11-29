'use client';

import React, { useState } from 'react';
import Timer from './Timer';
import type { Ticket } from '@/types/raffle';

interface TicketCardProps {
  ticket: Ticket;
  onBuyMore: () => void;
}

export default function TicketCard({ ticket, onBuyMore }: TicketCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = ticket.status === 'active';
  const isWon = ticket.status === 'won';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border-2 rounded-lg p-6 transition-all duration-300 ${
        isWon
          ? 'border-green-500 bg-green-500 bg-opacity-5 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/20'
          : 'border-amber-400 border-opacity-30 bg-black bg-opacity-50 hover:border-opacity-100 hover:shadow-lg hover:shadow-amber-400/30'
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {ticket.raffle.title}
          </h3>
          <p className="text-sm text-gray-400">Ticket #{ticket.id}</p>
        </div>
        <span className="text-3xl">{isWon ? '🎊' : '🎫'}</span>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        {isActive && (
          <span className="inline-block px-3 py-1 bg-amber-400 bg-opacity-20 border border-amber-400 rounded text-amber-400 text-xs font-bold">
            🟢 Active
          </span>
        )}
        {isWon && (
          <span className="inline-block px-3 py-1 bg-green-400 bg-opacity-20 border border-green-400 rounded text-green-400 text-xs font-bold">
            ✨ Winner!
          </span>
        )}
        {ticket.status === 'lost' && (
          <span className="inline-block px-3 py-1 bg-gray-600 bg-opacity-20 border border-gray-600 rounded text-gray-400 text-xs font-bold">
            ❌ Lost
          </span>
        )}
      </div>

      {/* Selected Numbers */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-2 font-semibold">YOUR NUMBERS</p>
        <div className="flex flex-wrap gap-2">
          {ticket.selectedNumbers.map((num) => (
            <span
              key={num}
              className={`px-3 py-1 rounded font-bold text-sm ${
                isWon
                  ? 'bg-green-400 text-black'
                  : 'bg-amber-400 text-black'
              }`}
            >
              {num}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-black bg-opacity-50 p-4 rounded border border-amber-400 border-opacity-20">
        <div>
          <p className="text-xs text-gray-400 mb-1">Amount Paid</p>
          <p className="text-lg font-bold text-amber-400">{ticket.amount} cUSD</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Prize Pool</p>
          <p className="text-lg font-bold text-amber-400">
            {ticket.raffle.winningPrice} cUSD
          </p>
        </div>
      </div>

      {/* Win Amount (if won) */}
      {isWon && ticket.winAmount && (
        <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded">
          <p className="text-xs text-gray-400 mb-1">Winnings</p>
          <p className="text-2xl font-bold text-green-400">+{ticket.winAmount} cUSD</p>
        </div>
      )}

      {/* Timer (if active) */}
      {isActive && (
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-2 font-semibold">Draw Closes In</p>
          <Timer endsAt={new Date(ticket.raffle.endDate)} compact={true} />
        </div>
      )}

      {/* Purchase Date */}
      <div className="mb-6 text-xs text-gray-500">
        Purchased: {new Date(ticket.purchaseDate).toLocaleDateString()} at{' '}
        {new Date(ticket.purchaseDate).toLocaleTimeString()}
      </div>

      {/* Actions */}
      <button
        onClick={onBuyMore}
        className={`w-full py-2 rounded font-bold transition-colors duration-300 ${
          isActive
            ? 'bg-amber-400 text-black hover:bg-amber-300'
            : 'bg-gray-600 text-white hover:bg-gray-500'
        }`}
      >
        {isActive ? '🎰 Buy More Tickets' : 'View Raffle'}
      </button>
    </div>
  );
}
