'use client';

import React from 'react';

export default function RaffleCardSkeleton() {
  return (
    <div className="w-full border-2 border-amber-400 border-opacity-30 rounded-lg p-6
      bg-black bg-opacity-50 animate-pulse"
    >
      {/* Header Skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
        <div className="w-8 h-8 bg-gray-700 rounded"></div>
      </div>

      {/* Description Skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-black bg-opacity-50 p-3 rounded border border-amber-400 border-opacity-20">
            <div className="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
            <div className="h-6 bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>

      {/* Timer Skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="h-10 bg-gray-700 rounded w-full"></div>
    </div>
  );
}
