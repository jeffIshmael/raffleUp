'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Raffle {
  id: string;
  name: string;
  description: string;
  prizePool: string;
  ticketPrice: number;
  numberRange: number;
  entries: number;
  takenNumbers: number[];
  endsAt: Date;
  expectedWinners?: number;
}

export interface UserParticipation {
  raffleId: string;
  selectedNumbers: number[];
  totalCost: number;
  timestamp: Date;
}

// Mock data
const INITIAL_RAFFLES: Raffle[] = [
  {
    id: 'gold-rush',
    name: 'Gold Rush',
    description: 'Select 5 lucky numbers and strike it rich',
    prizePool: '50,000',
    ticketPrice: 10,
    numberRange: 50,
    entries: 1250,
    takenNumbers: [1, 5, 7, 12, 23, 45, 49],
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    expectedWinners: 5,
  },
  {
    id: 'mega-jackpot',
    name: 'Mega Jackpot',
    description: 'Go big or go home - up to 10 numbers',
    prizePool: '100,000',
    ticketPrice: 15,
    numberRange: 70,
    entries: 3200,
    takenNumbers: [3, 14, 25, 38, 42, 55, 61],
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    expectedWinners: 10,
  },
  {
    id: 'lucky-seven',
    name: 'Lucky Seven',
    description: 'Pick 7 numbers for the ultimate rush',
    prizePool: '75,000',
    ticketPrice: 12,
    numberRange: 60,
    entries: 2100,
    takenNumbers: [2, 11, 27, 33, 44, 50, 58],
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    expectedWinners: 7,
  },
];

export function useRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>(INITIAL_RAFFLES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch raffles (mock)
  const fetchRaffles = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRaffles(INITIAL_RAFFLES);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch raffles');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single raffle by ID
  const getRaffleById = useCallback((id: string) => {
    return raffles.find((r) => r.id === id);
  }, [raffles]);

  // Get available numbers for a raffle
  const getAvailableNumbers = useCallback((raffleId: string) => {
    const raffle = getRaffleById(raffleId);
    if (!raffle) return [];

    const allNumbers = Array.from({ length: raffle.numberRange }, (_, i) => i + 1);
    return allNumbers.filter((num) => !raffle.takenNumbers.includes(num));
  }, [getRaffleById]);

  // Check if raffle is still active
  const isRaffleActive = useCallback((raffleId: string) => {
    const raffle = getRaffleById(raffleId);
    if (!raffle) return false;
    return raffle.endsAt > new Date();
  }, [getRaffleById]);

  // Get time remaining for raffle
  const getTimeRemaining = useCallback((raffleId: string) => {
    const raffle = getRaffleById(raffleId);
    if (!raffle) return null;

    const now = new Date().getTime();
    const end = raffle.endsAt.getTime();
    const remaining = end - now;

    if (remaining <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      };
    }

    return {
      days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
      hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((remaining % (1000 * 60)) / 1000),
      total: remaining,
    };
  }, [getRaffleById]);

  // Add taken number (simulate someone else buying)
  const addTakenNumber = useCallback((raffleId: string, number: number) => {
    setRaffles((prev) =>
      prev.map((r) =>
        r.id === raffleId
          ? {
              ...r,
              takenNumbers: [...new Set([...r.takenNumbers, number])],
            }
          : r
      )
    );
  }, []);

  // Batch add taken numbers
  const addTakenNumbers = useCallback((raffleId: string, numbers: number[]) => {
    setRaffles((prev) =>
      prev.map((r) =>
        r.id === raffleId
          ? {
              ...r,
              takenNumbers: [...new Set([...r.takenNumbers, ...numbers])],
              entries: r.entries + numbers.length,
            }
          : r
      )
    );
  }, []);

  // Update raffle
  const updateRaffle = useCallback((raffleId: string, updates: Partial<Raffle>) => {
    setRaffles((prev) =>
      prev.map((r) => (r.id === raffleId ? { ...r, ...updates } : r))
    );
  }, []);

  return {
    raffles,
    loading,
    error,
    fetchRaffles,
    getRaffleById,
    getAvailableNumbers,
    isRaffleActive,
    getTimeRemaining,
    addTakenNumber,
    addTakenNumbers,
    updateRaffle,
  };
}

// Hook for managing participations
export function useParticipations() {
  const [participations, setParticipations] = useState<UserParticipation[]>([]);

  const addParticipation = useCallback((participation: UserParticipation) => {
    setParticipations((prev) => [participation, ...prev]);
  }, []);

  const getParticipationsByRaffle = useCallback((raffleId: string) => {
    return participations.filter((p) => p.raffleId === raffleId);
  }, [participations]);

  const getTotalSpent = useCallback(() => {
    return participations.reduce((sum, p) => sum + p.totalCost, 0);
  }, [participations]);

  const getTotalEntries = useCallback(() => {
    return participations.reduce((sum, p) => sum + p.selectedNumbers.length, 0);
  }, [participations]);

  return {
    participations,
    addParticipation,
    getParticipationsByRaffle,
    getTotalSpent,
    getTotalEntries,
  };
}