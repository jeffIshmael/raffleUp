'use client';

import React, { useState } from 'react';
// import Timer from './Timer';

interface RaffleCardProps {
  raffle: any;
  onClick: () => void;
}

export default function RaffleCard({ raffle, onClick }: RaffleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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
          transition-colors"
        >
          {raffle.name}
        </h3>
        <span className="text-2xl">💎</span>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-6">{raffle.description}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400
          border-opacity-20"
        >
          <p className="text-xs text-gray-400 mb-1">Prize Pool</p>
          <p className="font-bold text-amber-400">{raffle.prizePool}</p>
        </div>
        <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400
          border-opacity-20"
        >
          <p className="text-xs text-gray-400 mb-1">Ticket</p>
          <p className="font-bold text-amber-400">{raffle.ticketPrice} cUSD</p>
        </div>
        <div className="bg-black bg-opacity-50 p-3 rounded border border-amber-400
          border-opacity-20"
        >
          <p className="text-xs text-gray-400 mb-1">Entries</p>
          <p className="font-bold text-amber-400">{raffle.entries}</p>
        </div>
      </div>

      {/* Timer */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">Draws In</p>
        {/* <Timer endsAt={raffle.endsAt} /> */}
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