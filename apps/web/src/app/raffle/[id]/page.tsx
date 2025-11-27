'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// import NumberGrid from '@/components/NumberGrid';
// import CheckoutModal from '@/components/CheckoutModal';
import { MOCK_RAFFLES } from '@/utils/constants';

export default function RafflePage() {
  const params = useParams();
  const router = useRouter();
  const raffleId = params.id as string;

  const raffle = MOCK_RAFFLES.find((r) => r.id === raffleId);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!raffle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-400">Raffle not found</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2 bg-amber-400 text-black rounded hover:bg-amber-300"
        >
          Back Home
        </button>
      </div>
    );
  }

  const totalCost = selectedNumbers.length * raffle.ticketPrice;

  const handleSelectNumber = (num: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const handleClearSelection = () => setSelectedNumbers([]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <button
          onClick={() => router.push('/')}
          className="text-amber-400 hover:text-amber-300 mb-6 flex items-center gap-2"
        >
          ← Back to Raffles
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-2">{raffle.name}</h1>
        <p className="text-gray-300 text-lg">{raffle.description}</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div className="border border-amber-400 border-opacity-30 p-6 rounded
          hover:border-opacity-60 transition-all duration-300"
        >
          <p className="text-gray-400 text-sm mb-2">Prize Pool</p>
          <p className="text-2xl font-bold text-amber-400">{raffle.prizePool} cUSD</p>
        </div>
        <div className="border border-amber-400 border-opacity-30 p-6 rounded
          hover:border-opacity-60 transition-all duration-300"
        >
          <p className="text-gray-400 text-sm mb-2">Ticket Price</p>
          <p className="text-2xl font-bold text-amber-400">{raffle.ticketPrice} cUSD</p>
        </div>
        <div className="border border-amber-400 border-opacity-30 p-6 rounded
          hover:border-opacity-60 transition-all duration-300"
        >
          <p className="text-gray-400 text-sm mb-2">Total Entries</p>
          <p className="text-2xl font-bold text-amber-400">{raffle.entries}</p>
        </div>
        <div className="border border-amber-400 border-opacity-30 p-6 rounded
          hover:border-opacity-60 transition-all duration-300"
        >
          <p className="text-gray-400 text-sm mb-2">Range</p>
          <p className="text-2xl font-bold text-amber-400">1-{raffle.numberRange}</p>
        </div>
      </div>

      {/* Number Selection */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-400">Select Your Numbers</h2>
          {selectedNumbers.length > 0 && (
            <button
              onClick={handleClearSelection}
              className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
            >
              Clear All ({selectedNumbers.length})
            </button>
          )}
        </div>

        {/* <NumberGrid
          numberRange={raffle.numberRange}
          selectedNumbers={selectedNumbers}
          takenNumbers={raffle.takenNumbers}
          onSelectNumber={handleSelectNumber}
        /> */}
      </div>

      {/* Selection Summary & Checkout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="border-2 border-amber-400 rounded p-8 bg-black bg-opacity-50
            backdrop-blur-sm"
          >
            <h3 className="text-xl font-bold text-amber-400 mb-4">Your Selection</h3>
            {selectedNumbers.length === 0 ? (
              <p className="text-gray-400">No numbers selected yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedNumbers.sort((a, b) => a - b).map((num) => (
                  <span
                    key={num}
                    className="bg-amber-400 text-black px-3 py-1 rounded font-semibold
                      text-sm shadow-lg"
                  >
                    #{num}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-2 border-amber-400 rounded p-8 bg-black bg-opacity-50
          backdrop-blur-sm h-fit sticky top-20"
        >
          <h3 className="text-xl font-bold text-amber-400 mb-6">Order Summary</h3>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-300">
              <span>Numbers Selected:</span>
              <span className="font-semibold">{selectedNumbers.length}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Price per Number:</span>
              <span className="font-semibold">{raffle.ticketPrice} cUSD</span>
            </div>
            <div className="border-t border-amber-400 border-opacity-20 pt-4 flex justify-between
              text-lg font-bold text-amber-400"
            >
              <span>Total:</span>
              <span>{totalCost} cUSD</span>
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            disabled={selectedNumbers.length === 0}
            className="w-full bg-amber-400 text-black py-3 rounded font-bold
              hover:bg-amber-300 transition-colors duration-300
              disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div></div>
        // <CheckoutModal
        //   selectedNumbers={selectedNumbers}
        //   totalCost={totalCost}
        //   ticketPrice={raffle.ticketPrice}
        //   onClose={() => setShowCheckout(false)}
        //   raffleName={raffle.name}
        // />
      )}
    </div>
  );
}
