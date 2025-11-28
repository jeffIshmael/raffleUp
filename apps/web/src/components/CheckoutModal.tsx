'use client';

import React, { useState } from 'react';

interface CheckoutModalProps {
  selectedNumbers: number[];
  totalCost: number;
  ticketPrice: number;
  raffleName: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function CheckoutModal({
  selectedNumbers,
  totalCost,
  ticketPrice,
  raffleName,
  onClose,
  onConfirm,
}: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'review' | 'confirm' | 'success'>('review');

  const handleConfirm = async () => {
    setIsProcessing(true);
    setStep('confirm');

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setStep('success');
    setIsProcessing(false);

    // Close modal after success
    setTimeout(() => {
      onConfirm?.();
      onClose();
    }, 10000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-black border-2 border-amber-400 rounded-lg shadow-2xl shadow-amber-400/30 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400/10 to-amber-600/10 border-b border-amber-400 border-opacity-30 px-6 py-4">
            <h2 className="text-2xl font-bold text-amber-400 text-center">
              {step === 'review' && '🎰 Order Review'}
              {step === 'confirm' && '⏳ Processing Payment'}
              {step === 'success' && '✨ Success!'}
            </h2>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Review Step */}
            {step === 'review' && (
              <div className="space-y-6">
                {/* Raffle Info */}
                <div className="bg-black bg-opacity-50 border border-amber-400 border-opacity-20 rounded p-4">
                  <p className="text-gray-400 text-sm mb-1">Raffle</p>
                  <p className="text-xl font-bold text-amber-400">{raffleName}</p>
                </div>

                {/* Selected Numbers */}
                <div className="bg-black bg-opacity-50 border border-amber-400 border-opacity-20 rounded p-4">
                  <p className="text-gray-400 text-sm mb-3">Your Selected Numbers</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNumbers.sort((a, b) => a - b).map((num) => (
                      <span
                        key={num}
                        className="bg-amber-400 text-black px-3 py-1 rounded font-bold text-sm shadow-md"
                      >
                        #{num}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-black bg-opacity-50 border border-amber-400 border-opacity-20 rounded p-4 space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Numbers Selected:</span>
                    <span className="font-semibold text-amber-400">{selectedNumbers.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Price per Number:</span>
                    <span className="font-semibold text-amber-400">{ticketPrice} cUSD</span>
                  </div>
                  <div className="border-t border-amber-400 border-opacity-20 pt-3 flex justify-between">
                    <span className="font-bold text-white">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-400">{totalCost} cUSD</span>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-400 bg-opacity-5 border border-amber-400 border-opacity-20 rounded p-3 text-xs text-gray-400">
                  <p>
                    ⚠️ By confirming, you agree to participate in this raffle. Your cUSD will be deducted
                    from your Celo wallet. Winners will be announced when the raffle ends.
                  </p>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {step === 'confirm' && (
              <div className="space-y-6 text-center">
                <div className="py-8">
                  <div
                    className="inline-block w-16 h-16 border-4 border-amber-400 border-opacity-30 border-t-amber-400 rounded-full animate-spin"
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold text-amber-400 mb-2">Processing Payment</p>
                  <p className="text-gray-400 text-sm">Please confirm the transaction in your wallet...</p>
                </div>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="space-y-6 text-center py-4">
                <div className="text-6xl animate-bounce">🎉</div>
                <div>
                  <p className="text-xl font-bold text-green-400 mb-2">Payment Successful!</p>
                  <p className="text-gray-400 mb-4">Your {selectedNumbers.length} numbers have been registered.</p>
                  <p className="text-sm text-gray-500">
                    Transaction ID: <span className="font-mono text-xs text-gray-400">0x{Math.random().toString(16).slice(2, 10)}</span>
                  </p>
                </div>
                <div className="bg-green-400 bg-opacity-10 border border-green-400 border-opacity-30 rounded p-3 text-sm text-green-300">
                  You're all set! Good luck! 🍀
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-amber-400 border-opacity-20 px-6 py-4 flex gap-3">
            {step === 'review' && (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded border-2 border-amber-400 border-opacity-30 text-amber-400 font-semibold hover:border-opacity-60 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 rounded bg-amber-400 text-black font-bold hover:bg-amber-300 transition-all duration-300 shadow-lg shadow-amber-400/30"
                >
                  💳 Pay {totalCost} cUSD
                </button>
              </>
            )}

            {step === 'confirm' && (
              <button
                disabled
                className="w-full px-4 py-2 rounded bg-gray-600 text-gray-400 font-semibold cursor-not-allowed"
              >
                Processing...
              </button>
            )}

            {step === 'success' && (
              <button
                onClick={onClose}
                className="w-full px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-500 transition-all duration-300"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}