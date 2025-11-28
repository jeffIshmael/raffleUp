'use client';

import React, { useState } from 'react';

const USER_DATA = {
  wallet: '0x1234',
  totalWagered: 2500,
  totalWinnings: 8500,
  participations: [
    {
      id: 1,
      raffle: 'Gold Rush',
      numbers: [5, 12, 23, 45],
      amount: 400,
      date: '2025-01-15',
      won: true,
      winAmount: 5000,
    },
    {
      id: 2,
      raffle: 'Lucky Seven',
      numbers: [7, 14, 21],
      amount: 300,
      date: '2025-01-10',
      won: false,
    },
    {
      id: 3,
      raffle: 'Mega Jackpot',
      numbers: [1, 2, 3, 4, 5],
      amount: 500,
      date: '2025-01-08',
      won: true,
      winAmount: 3500,
    },
  ],
};

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);

  const copyWallet = () => {
    navigator.clipboard.writeText(USER_DATA.wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">

      {/* Wallet & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Wallet Card */}
        <div className="border-2 border-amber-400 rounded p-8 bg-black bg-opacity-50">
          <p className="text-gray-400 text-sm mb-4">Connected Wallet</p>
          <div className="flex items-center gap-3">
            <p className="text-xl font-mono text-amber-400">{USER_DATA.wallet}</p>
            <button
              onClick={copyWallet}
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="border-2 border-green-500 border-opacity-30 rounded p-8 bg-black bg-opacity-50">
          <p className="text-gray-400 text-sm mb-2">Total Winnings</p>
          <p className="text-3xl font-bold text-green-400">{USER_DATA.totalWinnings} cUSD</p>
        </div>

        <div className="border-2 border-amber-400 border-opacity-30 rounded p-8 bg-black bg-opacity-50">
          <p className="text-gray-400 text-sm mb-2">Total Wagered</p>
          <p className="text-3xl font-bold text-amber-400">{USER_DATA.totalWagered} cUSD</p>
        </div>
      </div>

      {/* Participation History */}
      <div>
        <h2 className="text-2xl font-bold text-amber-400 mb-6">📊 Participation History</h2>

        <div className="space-y-6">
          {USER_DATA.participations.map((p) => (
            <div
              key={p.id}
              className={`border-2 rounded p-6 transition-all duration-300
                ${
                  p.won
                    ? 'border-green-500 bg-green-500 bg-opacity-5'
                    : 'border-amber-400 border-opacity-30 hover:border-opacity-60'
                }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Raffle</p>
                  <p className="text-lg font-bold text-white">{p.raffle}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Numbers</p>
                  <div className="flex flex-wrap gap-1">
                    {p.numbers.map((n) => (
                      <span
                        key={n}
                        className="bg-amber-400 text-black text-xs px-2 py-1 rounded font-semibold"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Amount</p>
                  <p className="text-lg text-amber-400">{p.amount} cUSD</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Date</p>
                  <p className="text-lg text-gray-300">{p.date}</p>
                </div>

                <div className="flex items-center justify-end">
                  {p.won ? (
                    <div className="text-center">
                      <p className="text-green-400 font-bold">WON! 🎉</p>
                      <p className="text-green-400 text-xl font-bold">+{p.winAmount} cUSD</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">—</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
