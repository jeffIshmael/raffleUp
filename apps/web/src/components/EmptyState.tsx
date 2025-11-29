import React from "react";

const EmptyState = () => {
  return (
    <div className="text-center py-16">
      <div className="inline-block mb-6">
        <div className="text-6xl mb-4">🎲</div>
      </div>
      <h3 className="text-xl font-semibold text-amber-100 mb-2">
        No Active Raffles
      </h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        There are currently no raffles available. Check back soon for exciting
        opportunities to win amazing prizes!
      </p>
    </div>
  );
};

export default EmptyState;
