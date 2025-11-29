"use server";
import prisma from "@/lib/prisma";
import { Ticket } from "@/types/raffle";

interface Raffle {
  title: string;
  description: string;
  expectedWinners: number;
  winningPrice: string;
  blockchainId: number;
  ticketPrice: string;
  startNo: number;
  endNo: number;
  startDate: Date;
  endDate: Date;
  status: string;
}

interface BuyRaffle {
  address: string;
  selectedNos: number[];
  raffleId: number;
}

interface ChosenDataItem {
  buyer: string;
  numbers: number[];
}

//   GET ALL RAFFLES
export async function getRaffles() {
  try {
    const raffles = await prisma.raffle.findMany();
    return raffles;
  } catch (error) {
    console.error("Error getting raffles:", error);
    return null;
  }
}

//   CHECK IF WALLET EXISTS
export async function checkWallet(address: string): Promise<boolean | null> {
  try {
    const user = await prisma.user.findUnique({ where: { address } });
    return !!user;
  } catch (error) {
    console.log("checkWallet error:", error);
    return null;
  }
}

//   CREATE RAFFLE
export async function createRaffle(params: Raffle) {
  try {
    const raffle = await prisma.raffle.create({
      data: {
        ...params,
        takenNos: JSON.stringify([]),
        chosenData: JSON.stringify([]),
      },
    });
    return raffle;
  } catch (error) {
    console.log("createRaffle error:", error);
    return null;
  }
}

//   GET RAFFLE BY ID
export async function getRaffleById(raffleId: number) {
  try {
    return await prisma.raffle.findUnique({ where: { id: raffleId } });
  } catch (error) {
    console.log("getRaffleById error:", error);
    return null;
  }
}

//   BUY RAFFLE TICKET
export async function buyRaffleTicket(params: BuyRaffle) {
  try {
    // 1. Register user if not found
    const walletRegistered = await checkWallet(params.address);
    if (!walletRegistered) {
      await prisma.user.create({
        data: {
          address: params.address,
          raffleIds: JSON.stringify([]),
        },
      });
    }

    // 2. Get raffle
    const raffle = await getRaffleById(params.raffleId);
    if (!raffle) return null;

    const selectedNumbers = raffle.takenNos ? JSON.parse(raffle.takenNos) : [];
    const chosenData = raffle.chosenData ? JSON.parse(raffle.chosenData) : [];

    // Add selected numbers
    selectedNumbers.push(...params.selectedNos);

    // Add user & their chosen numbers
    chosenData.push({
      buyer: params.address,
      numbers: params.selectedNos,
    });

    // 3. Update the raffle
    const updatedRaffle = await prisma.raffle.update({
      where: { id: params.raffleId },
      data: {
        takenNos: JSON.stringify(selectedNumbers),
        chosenData: JSON.stringify(chosenData),
      },
    });

    // 4. Update user's raffleIds
    const user = await prisma.user.findUnique({
      where: { address: params.address },
    });

    const userRaffleData = user?.raffleIds ? JSON.parse(user.raffleIds) : [];

    userRaffleData.push({
      raffleId: params.raffleId,
      numbers: params.selectedNos,
    });

    await prisma.user.update({
      where: { address: params.address },
      data: { raffleIds: JSON.stringify(userRaffleData) },
    });

    return updatedRaffle;
  } catch (error) {
    console.log("buyRaffleTicket error:", error);
    return null;
  }
}

//   GET USER ACTIVE TICKETS
export async function getUserActiveTickets(address: string): Promise<Ticket[]> {
  try {
    const user = await prisma.user.findUnique({ where: { address } });
    if (!user || !user.raffleIds) return [];

    const userRaffleData = JSON.parse(user.raffleIds) as Array<{
      raffleId: number;
      numbers: number[];
    }>;

    const tickets: Ticket[] = [];

    // Fetch raffle details for each ticket and map to Ticket interface
    for (let i = 0; i < userRaffleData.length; i++) {
      const data = userRaffleData[i];
      const raffle = await getRaffleById(data.raffleId);

      if (!raffle) continue;

      // Determine ticket status based on raffle endDate
      let ticketStatus: "active" | "won" | "lost" = "active";
      const now = new Date();
      const raffleEndDate = new Date(raffle.endDate);

      if (raffleEndDate < now) {
        // Raffle has ended - check if user won
        ticketStatus = "lost"; // Default to lost

        // Check if user's numbers match any winning numbers (from chosenData)
        const chosenData = raffle.chosenData
          ? (JSON.parse(raffle.chosenData) as ChosenDataItem[])
          : [];

        const userChoice = chosenData.find(
          (choice) => choice.buyer.toLowerCase() === address.toLowerCase()
        );

        // If you have a way to determine winners, update this logic
        // For now, we'll assume lost status for ended raffles
        if (userChoice) {
          // You can add winner logic here based on your business logic
          ticketStatus = "lost";
        }
      }

      const ticket: Ticket = {
        id: i + 1, // Generate simple ID based on index
        raffleId: data.raffleId,
        raffle: {
          id: raffle.id,
          title: raffle.title,
          description: raffle.description,
          ticketPrice: raffle.ticketPrice,
          winningPrice: raffle.winningPrice,
          endDate: new Date(raffle.endDate),
          status: raffle.status,
        },
        selectedNumbers: data.numbers,
        amount: (
          parseFloat(raffle.ticketPrice) * data.numbers.length
        ).toString(),
        purchaseDate: raffle.startDate,
        status: ticketStatus,
      };

      tickets.push(ticket);
    }

    // Filter only active tickets
    return tickets.filter((t) => t.status === "active");
  } catch (error) {
    console.log("getUserActiveTickets error:", error);
    return [];
  }
}

// ============================================================================
// GET USER RAFFLE HISTORY (UPDATED)
// ============================================================================

export async function getUserRaffleHistory(address: string): Promise<Ticket[]> {
  try {
    const user = await prisma.user.findUnique({ where: { address } });
    if (!user || !user.raffleIds) return [];

    const userRaffleData = JSON.parse(user.raffleIds) as Array<{
      raffleId: number;
      numbers: number[];
    }>;

    const tickets: Ticket[] = [];

    // Fetch raffle details for each ticket and map to Ticket interface
    for (let i = 0; i < userRaffleData.length; i++) {
      const data = userRaffleData[i];
      const raffle = await getRaffleById(data.raffleId);

      if (!raffle) continue;

      // Determine ticket status based on raffle endDate
      let ticketStatus: "active" | "won" | "lost" = "active";
      const now = new Date();
      const raffleEndDate = new Date(raffle.endDate);

      if (raffleEndDate < now) {
        ticketStatus = "lost"; // Default to lost for ended raffles
        // Add winner check logic here if you have a winners table
      }

      const ticket: Ticket = {
        id: i + 1,
        raffleId: data.raffleId,
        raffle: {
          id: raffle.id,
          title: raffle.title,
          description: raffle.description,
          ticketPrice: raffle.ticketPrice,
          winningPrice: raffle.winningPrice,
          endDate: new Date(raffle.endDate),
          status: raffle.status,
        },
        selectedNumbers: data.numbers,
        amount: (
          parseFloat(raffle.ticketPrice) * data.numbers.length
        ).toString(),
        purchaseDate: raffle.startDate,
        status: ticketStatus,
      };

      tickets.push(ticket);
    }

    // Return all tickets (active, won, lost)
    return tickets;
  } catch (error) {
    console.log("getUserRaffleHistory error:", error);
    return [];
  }
}

export async function getUserTicketsByStatus(
  address: string,
  status: "active" | "won" | "lost"
): Promise<Ticket[]> {
  try {
    const allTickets = await getUserRaffleHistory(address);
    return allTickets.filter((t) => t.status === status);
  } catch (error) {
    console.log("getUserTicketsByStatus error:", error);
    return [];
  }
}

// Get all past winners (completed raffles with winners)
export async function getPastWinners() {
    try {
      const raffles = await prisma.raffle.findMany({
        where: {
          endDate: {
            lt: new Date(), // Only completed raffles
          },
        },
        orderBy: {
          endDate: 'desc',
        },
      });
  
      const winners = [];
  
      for (const raffle of raffles) {
        if (!raffle.chosenData) continue;
  
        const chosenData = JSON.parse(raffle.chosenData) as ChosenDataItem[];
  
        // You can add logic here to determine actual winners
        // For now, showing the last participant as example
        // In production, this should come from a Winners table
  
        for (const participant of chosenData) {
          winners.push({
            id: `${raffle.id}-${participant.buyer}`,
            raffleId: raffle.id,
            raffleName: raffle.title,
            winner: `${participant.buyer.slice(0, 6)}...${participant.buyer.slice(-4)}`,
            walletAddress: participant.buyer,
            winningNumbers: participant.numbers,
            amount: raffle.winningPrice,
            date: new Date(raffle.endDate).toISOString().split('T')[0],
          });
        }
      }
  
      return winners;
    } catch (error) {
      console.log("getPastWinners error:", error);
      return [];
    }
  }
  
  // Get user profile stats
  export async function getUserProfileStats(address: string) {
    try {
      const user = await prisma.user.findUnique({ where: { address } });
      if (!user || !user.raffleIds) {
        return {
          totalTickets: 0,
          totalWagered: '0',
          totalWinnings: '0',
          ticketsWon: 0,
          ticketsLost: 0,
        };
      }
  
      const userRaffleData = JSON.parse(user.raffleIds) as Array<{
        raffleId: number;
        numbers: number[];
      }>;
  
      let totalWagered = 0;
      let totalWinnings = 0;
      let ticketsWon = 0;
      let ticketsLost = 0;
  
      for (const data of userRaffleData) {
        const raffle = await getRaffleById(data.raffleId);
        if (!raffle) continue;
  
        const ticketAmount = parseFloat(raffle.ticketPrice) * data.numbers.length;
        totalWagered += ticketAmount;
  
        const now = new Date();
        const raffleEndDate = new Date(raffle.endDate);
  
        if (raffleEndDate < now) {
          // Check if user won (this should be updated with actual winner logic)
          // For now, default to lost
          ticketsLost += 1;
        } else {
          // Active ticket
        }
      }
  
      return {
        totalTickets: userRaffleData.length,
        totalWagered: totalWagered.toFixed(2),
        totalWinnings: totalWinnings.toFixed(2),
        ticketsWon,
        ticketsLost,
      };
    } catch (error) {
      console.log("getUserProfileStats error:", error);
      return {
        totalTickets: 0,
        totalWagered: '0',
        totalWinnings: '0',
        ticketsWon: 0,
        ticketsLost: 0,
      };
    }
  }