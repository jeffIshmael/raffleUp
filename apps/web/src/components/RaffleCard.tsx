'use client';

import React, { useState } from 'react';
import Timer from './Timer';
import type { Raffle } from '@/types/raffle';

interface RaffleCardProps {
  raffle: Raffle;
  onClick: () => void;
}

export default function RaffleCard({ raffle, onClick }: RaffleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Parse taken numbers
  const takenNumbers = raffle.takenNos ? JSON.parse(raffle.takenNos).length : 0;
  const totalNumbers = raffle.endNo - raffle.startNo + 1;
  const availableNumbers = totalNumbers - takenNumbers;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full text-left border-2 border-amber-400 border-opacity-30 rounded-lg p-6
        bg-black bg-opacity-50 hover:border-opacity-100 transition-all duration-300
        hover:shadow-lg hover:shadow-amber-400/30 group"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white group-hover:text-amber-400
          transition-colors truncate"
        >
          {raffle.title}
        </h3>
        <span className="text-2xl ml-2">💎</span>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-6 line-clamp-2">
        {raffle.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400
          border-opacity-20"
        >
          <p className="text-xs text-gray-400 mb-1">Win prize</p>
          <p className="font-bold text-teal-400">{raffle.winningPrice} cUSD</p>
        </div>
        <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400
          border-opacity-20"
        >
          <p className="text-xs text-gray-400 mb-1">Entry fee</p>
          <p className="font-bold text-amber-400">{raffle.ticketPrice} cUSD</p>
        </div>
        <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400
          border-opacity-20"
        >
          <p className="text-xs text-gray-400 mb-1">Available entries</p>
          <p className="font-bold text-amber-400">{availableNumbers}</p>
        </div>
      </div>

      {/* Timer */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-400 mb-2">Draws In:</p>
        <Timer endsAt={new Date(raffle.endDate)} />
      </div>

      {/* CTA */}
      <button
        className="w-full bg-amber-400 text-black py-2 rounded font-bold
          hover:bg-amber-300 transition-colors duration-300 group-hover:shadow-lg
          group-hover:shadow-amber-400/50"
      >
        Select Numbers →
      </button>
    </button>
  );
}
