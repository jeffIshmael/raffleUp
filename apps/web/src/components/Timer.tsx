'use client';

import React, { useState, useEffect } from 'react';

interface TimerProps {
  endsAt: Date;
  onExpire?: () => void;
  compact?: boolean;
}

interface TimeUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Timer({ endsAt, onExpire, compact = false }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeUnits | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = endsAt.getTime();
      const remaining = end - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onExpire?.();
        return;
      }

      setTimeRemaining({
        days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((remaining % (1000 * 60)) / 1000),
      });
    };

    // Initial update
    updateTimer();

    // Set interval
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onExpire]);

  if (!timeRemaining) {
    return <div className="text-gray-400 text-sm">Loading...</div>;
  }

  if (isExpired) {
    return (
      <div className="text-red-500 font-bold text-sm flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        Raffle Ended
      </div>
    );
  }

  // Compact version for card headers
  if (compact) {
    const hasEnoughTime = timeRemaining.days > 0;
    const displayTime = hasEnoughTime
      ? `${timeRemaining.days}d ${timeRemaining.hours}h`
      : `${timeRemaining.hours}h ${timeRemaining.minutes}m`;

    return (
      <div className="font-mono text-sm  text-amber-400">
        {displayTime}
      </div>
    );
  }

  // Full version for detail pages
  return (
    <div className="flex flex-wrap gap-2">
      {/* Days */}
      <div className="flex items-center gap-1">
        <div >
          <div className="text-md  text-amber-400 font-mono">
            {String(timeRemaining.days).padStart(2, '0')}
          </div>
        </div>
        <span className="text-xs text-gray-400 ">Days</span>
      </div>

      {/* Hours */}
      <div className="flex items-center gap-1">
        <div >
          <div className="text-md text-amber-400 font-mono">
            {String(timeRemaining.hours).padStart(2, '0')}
          </div>
        </div>
        <span className="text-xs text-gray-400 ">Hrs</span>
      </div>

      {/* Minutes */}
      <div className="flex items-center gap-1">
        <div >
          <div className="text-md  text-amber-400 font-mono">
            {String(timeRemaining.minutes).padStart(2, '0')}
          </div>
        </div>
        <span className="text-xs text-gray-400 ">Mins</span>
      </div>

      {/* Seconds */}
      <div className="flex items-center gap-1">
        <div>
          <div className={`text-md  font-mono ${
            timeRemaining.seconds <= 10 ? 'text-red-500 animate-pulse' : 'text-amber-400'
          }`}>
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
        </div>
        <span className="text-xs text-gray-400 ">Secs</span>
      </div>
    </div>
  );
}
