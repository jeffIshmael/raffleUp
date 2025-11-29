'use client';

import React from 'react';

interface MyTicketsEmptyProps {
  onNavigate: () => void;
}

export default function MyTicketsEmpty({ onNavigate }: MyTicketsEmptyProps) {
  return (
    <div className="text-center py-16">
      <div className="inline-block mb-6">
        <div className="text-6xl mb-4">🎫</div>
      </div>
      <h3 className="text-2xl font-bold text-amber-400 mb-2">
        No Active Tickets
      </h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        You haven't purchased any raffle tickets yet. Browse our live raffles and
        pick your lucky numbers to get started!
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={onNavigate}
          className="px-6 py-3 bg-amber-400 text-black font-bold rounded hover:bg-amber-300 transition-colors"
        >
          🎰 Browse Raffles
        </button>
    
      </div>
    </div>
  );
}