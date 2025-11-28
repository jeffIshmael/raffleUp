'use client';

import React, { useState } from 'react';

interface NumberGridProps {
  numberRange: number;
  selectedNumbers: number[];
  takenNumbers: number[];
  onSelectNumber: (num: number) => void;
}

export default function NumberGrid({
  numberRange,
  selectedNumbers,
  takenNumbers,
  onSelectNumber,
}: NumberGridProps) {
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);

  // Generate array of numbers
  const numbers = Array.from({ length: numberRange }, (_, i) => i + 1);

  // Determine grid columns based on range
  const getGridCols = () => {
    if (numberRange <= 20) return 'grid-cols-5';
    if (numberRange <= 50) return 'grid-cols-8';
    return 'grid-cols-10';
  };

  // Get state for a number
  const getNumberState = (num: number) => {
    if (selectedNumbers.includes(num)) return 'selected';
    if (takenNumbers.includes(num)) return 'taken';
    return 'available';
  };

  return (
    <div className="w-full">
      {/* Info Bar */}
      <div className="mb-8 flex items-center justify-between bg-black bg-opacity-50 border border-amber-400 border-opacity-20 rounded p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-400 border-2 border-amber-300 rounded"></div>
            <span className="text-sm text-gray-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-sm text-gray-400">Taken</span>
          </div>
        </div>
        <div className="text-sm text-amber-400 font-semibold">
          {selectedNumbers.length} of {numberRange - takenNumbers.length}  Selected
        </div>
      </div>

      {/* Number Grid */}
      <div className={`grid ${getGridCols()} gap-3 p-6 bg-black bg-opacity-30 border-2 border-amber-400 border-opacity-20 rounded-lg`}>
        {numbers.map((num) => {
          const state = getNumberState(num);
          const isSelected = state === 'selected';
          const isTaken = state === 'taken';
          const isHovered = hoveredNumber === num;

          return (
            <button
              key={num}
              onClick={() => {
                if (state !== 'taken') {
                  onSelectNumber(num);
                }
              }}
              onMouseEnter={() => setHoveredNumber(num)}
              onMouseLeave={() => setHoveredNumber(null)}
              disabled={isTaken}
              className={`
                relative w-full aspect-square rounded-lg font-bold text-lg
                transition-all duration-200 transform
                ${
                  isTaken
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                    : isSelected
                    ? 'bg-amber-400 text-black border-2 border-amber-300 shadow-lg shadow-amber-400/50 scale-105 hover:scale-110'
                    : 'bg-gradient-to-br from-gray-800 to-black border-2 border-amber-400 border-opacity-40 text-amber-400 hover:border-amber-400 hover:border-opacity-100 hover:shadow-lg hover:shadow-amber-400/30'
                }
                ${isHovered && !isTaken ? 'scale-110' : ''}
              `}
            >
              {/* Glow effect for selected/hovered */}
              {(isSelected || isHovered) && !isTaken && (
                <div
                  className="absolute inset-0 rounded-lg bg-amber-400 opacity-10 blur-sm"
                  style={{
                    animation: 'glow-pulse 2s ease-in-out infinite',
                  }}
                />
              )}

              {/* Number display */}
              <span className="relative z-10 block">{num}</span>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-4 bg-amber-400 bg-opacity-5 border border-amber-400 border-opacity-20 rounded text-sm text-gray-300">
        <p>
          💡 <strong>Tip:</strong> Click on available numbers to select them. You can choose as many as you want!
          Gray numbers are already taken by other players.
        </p>
      </div>

      <style jsx>{`
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
