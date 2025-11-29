'use client';

import React, { useEffect, useState } from 'react';
import ConfettiEffect from '@/components/ConfettiEffect';
import { getPastWinners } from '@/lib/prismaFunctions';

interface Winner {
  id: string;
  raffleId: number;
  raffleName: string;
  winner: string;
  walletAddress: string;
  winningNumbers: number[];
  amount: string;
  date: string;
}

type WinnersState = 'loading' | 'error' | 'success';

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [pageState, setPageState] = useState<WinnersState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setPageState('loading');
        const data = await getPastWinners();
        setWinners(data);
        setPageState('success');
      } catch (error) {
        setPageState('error');
        setErrorMessage('Failed to load winners');
      }
    };

    fetchWinners();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      <ConfettiEffect />

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🎊</span>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400">
            Past Winners
          </h1>
        </div>
        <p className="text-gray-300 text-lg">
          Celebrating our lucky winners and their big wins
        </p>
      </div>

      {/* Loading */}
      {pageState === 'loading' && (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-800 rounded animate-pulse border-2 border-amber-400 border-opacity-20"
            ></div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {pageState === 'success' && winners.length === 0 && (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🎲</p>
          <p className="text-gray-400 text-lg">No completed raffles yet</p>
        </div>
      )}

      {/* Winners List */}
      {pageState === 'success' && winners.length > 0 && (
        <div className="space-y-6">
          {winners.map((winner, idx) => (
            <div
              key={winner.id}
              className="border-2 border-amber-400 border-opacity-40 rounded p-6 lg:p-8
                hover:border-opacity-100 transition-all duration-300
                hover:shadow-lg hover:shadow-amber-400/20 group bg-black bg-opacity-30"
              style={{
                animation: `slideIn 0.6s ease-out ${idx * 0.1}s both`,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                {/* Raffle Name */}
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-2">RAFFLE</p>
                  <p className="text-xl font-bold text-amber-400">
                    {winner.raffleName}
                  </p>
                </div>

                {/* Winner Address */}
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-2">WINNER</p>
                  <p className="text-lg font-mono text-gray-300">{winner.winner}</p>
                </div>

                {/* Winning Numbers */}
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-2">
                    WINNING NUMBERS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {winner.winningNumbers.map((num) => (
                      <span
                        key={num}
                        className="bg-amber-400 text-black px-3 py-1 rounded font-bold text-sm"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prize Amount */}
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-2">PRIZE</p>
                  <p className="text-2xl font-bold text-green-400">
                    {winner.amount} cUSD
                  </p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-2">DATE</p>
                  <p className="text-lg text-gray-300">{winner.date}</p>
                </div>

                {/* Celebration Icon */}
                <div className="flex items-center justify-center lg:justify-end">
                  <div className="text-4xl group-hover:scale-125 transition-transform">
                    🎉
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {pageState === 'error' && (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">⚠️</p>
          <p className="text-red-400 text-lg">{errorMessage}</p>
        </div>
      )}

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
