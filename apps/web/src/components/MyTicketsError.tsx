'use client';

import React from 'react';

interface MyTicketsErrorProps {
  message: string;
  onRetry: () => void;
}

export default function MyTicketsError({ message, onRetry }: MyTicketsErrorProps) {
  return (
    <div className="text-center py-16">
      <div className="inline-block mb-6">
        <div className="text-6xl mb-4">⚠️</div>
      </div>
      <h3 className="text-2xl font-bold text-red-400 mb-2">
        Oops! Something Went Wrong
      </h3>
      <p className="text-gray-400 mb-4 max-w-md mx-auto">{message}</p>
      <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded p-4 mb-8 max-w-md mx-auto">
        <p className="text-sm text-red-400 font-mono">{message}</p>
      </div>
      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-amber-400 text-black font-bold rounded hover:bg-amber-300 transition-colors"
        >
          🔄 Try Again
        </button>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-6 py-3 border-2 border-amber-400 text-amber-400 font-bold rounded hover:bg-amber-400 hover:text-black transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
