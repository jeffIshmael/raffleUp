'use client';

import React, { useState } from 'react';

interface NumberGridProps {
  fromRange: number;
  toRange: number;
  selectedNumbers: number[];
  takenNumbers: number[];
  onSelectNumber: (num: number) => void;
}

export default function NumberGrid({
  fromRange,
  toRange,
  selectedNumbers,
  takenNumbers,
  onSelectNumber,
}: NumberGridProps) {
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);

  // Calculate number range
  const numberRange = toRange - fromRange + 1;

  // Generate array of numbers from fromRange to toRange
  const numbers = Array.from(
    { length: numberRange },
    (_, i) => fromRange + i
  );

  // Determine grid columns based on range
  const getGridCols = () => {
    if (numberRange <= 20) return 'grid-cols-5';
    if (numberRange <= 50) return 'grid-cols-8';
    if (numberRange <= 100) return 'grid-cols-10';
    return 'grid-cols-12';
  };

  // Get state for a number
  const getNumberState = (num: number) => {
    if (selectedNumbers.includes(num)) return 'selected';
    if (takenNumbers.includes(num)) return 'taken';
    return 'available';
  };

  const availableCount = (numberRange - takenNumbers.length);

  return (
    <div className="w-full">
      {/* Info Bar */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between bg-black bg-opacity-50 border border-amber-400 border-opacity-20 rounded p-4 gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-gray-800 to-black border-2 border-amber-400 border-opacity-40 text-amber-400 hover:border-amber-400 hover:border-opacity-100 hover:shadow-lg hover:shadow-amber-400/30 rounded"></div>
            <span className="text-sm text-gray-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-400 border-2 border-amber-300 rounded"></div>
            <span className="text-sm text-gray-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-sm text-gray-400">Taken</span>
          </div>
        </div>
        <div className="text-sm text-amber-400 font-semibold whitespace-nowrap">
          {selectedNumbers.length} selected • {availableCount} available
        </div>
      </div>

      {/* Range Display */}
      <div className="mb-6 text-center">
        <p className="text-gray-400 text-sm mb-2">Select numbers from</p>
        <p className="text-2xl font-bold text-amber-400">
          {fromRange} - {toRange}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {numberRange} total numbers available
        </p>
      </div>

      {/* Number Grid */}
      <div className={`grid ${getGridCols()} gap-2 md:gap-3 p-4 md:p-6 bg-black bg-opacity-30 border-2 border-amber-400 border-opacity-20 rounded-lg`}>
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
                relative w-full aspect-square rounded-lg font-bold text-sm md:text-lg
                transition-all duration-200 transform
                ${
                  isTaken
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600 opacity-60'
                    : isSelected
                    ? 'bg-amber-400 text-black border-2 border-amber-300 shadow-lg shadow-amber-400/50 scale-105 hover:scale-110'
                    : 'bg-gradient-to-br from-gray-800 to-black border-2 border-amber-400 border-opacity-40 text-amber-400 hover:border-amber-400 hover:border-opacity-100 hover:shadow-lg hover:shadow-amber-400/30'
                }
                ${isHovered && !isTaken ? 'scale-110' : ''}
              `}
              title={
                isTaken
                  ? `Number ${num} taken`
                  : isSelected
                  ? `Number ${num} selected`
                  : `Select number ${num}`
              }
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
                  <span className="text-xl md:text-2xl">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-4 bg-amber-400 bg-opacity-5 border border-amber-400 border-opacity-20 rounded text-sm text-gray-300">
        <p>
          💡 <strong>Tip:</strong> Click on available numbers (yellow outline) to select them.
          You can choose as many numbers as you want. Gray numbers are already taken by other players.
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