'use client';

import React from 'react';
// import ConfettiEffect from '@/components/ConfettiEffect';

const PAST_WINNERS = [
  {
    id: 1,
    raffleId: 'gold-rush',
    raffleName: 'Gold Rush',
    winner: '0x1234...5678',
    winningNumber: 42,
    amount: 5000,
    date: '2025-01-15',
  },
  {
    id: 2,
    raffleId: 'mega-jackpot',
    raffleName: 'Mega Jackpot',
    winner: '0xabcd...efgh',
    winningNumber: 7,
    amount: 12500,
    date: '2025-01-10',
  },
  {
    id: 3,
    raffleId: 'lucky-seven',
    raffleName: 'Lucky Seven',
    winner: '0x9999...8888',
    winningNumber: 33,
    amount: 3200,
    date: '2025-01-08',
  },
];

export default function WinnersPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* <ConfettiEffect /> */}

      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-amber-400">
        🎊 Past Winners
      </h1>
      <p className="text-gray-300 mb-12">
        Celebrating our lucky winners and their big wins
      </p>

      <div className="space-y-6">
        {PAST_WINNERS.map((winner, idx) => (
          <div
            key={winner.id}
            className="border-2 border-amber-400 border-opacity-30 rounded p-8
              hover:border-opacity-60 transition-all duration-300
              hover:shadow-lg hover:shadow-amber-400/20 group"
            style={{
              animation: `slideIn 0.6s ease-out ${idx * 0.1}s both`,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Raffle</p>
                <p className="text-xl font-bold text-amber-400">{winner.raffleName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Winner</p>
                <p className="text-lg font-mono text-gray-300">{winner.winner}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Winning Number</p>
                <p className="text-3xl font-bold text-amber-400">#{winner.winningNumber}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Prize</p>
                <p className="text-2xl font-bold text-green-400">{winner.amount} cUSD</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Date</p>
                <p className="text-lg text-gray-300">{winner.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
