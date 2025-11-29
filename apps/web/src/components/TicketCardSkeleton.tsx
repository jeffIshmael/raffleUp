'use client';

import React from 'react';

export default function TicketCardSkeleton() {
  return (
    <div className="border-2 border-amber-400 border-opacity-30 rounded-lg p-6
      bg-black bg-opacity-50 animate-pulse"
    >
      {/* Header Skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        </div>
        <div className="w-8 h-8 bg-gray-700 rounded"></div>
      </div>

      {/* Badge Skeleton */}
      <div className="mb-4 h-6 bg-gray-700 rounded w-20"></div>

      {/* Numbers Skeleton */}
      <div className="mb-6">
        <div className="h-3 bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-black bg-opacity-50 rounded">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-gray-700 rounded mb-2 w-1/2"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Button Skeleton */}
      <div className="h-10 bg-gray-700 rounded w-full"></div>
    </div>
  );
}
