"use server";
import prisma from "@/lib/prisma";
import { Ticket } from "@/types/raffle";
import type { Raffle as raffleType } from "@/types/raffle";
import { getWinnersFromContract } from "./agentFunctions";

interface Raffle {
  title: string;
  description: string;
  expectedWinners: number;
  winningPrice: string;
  blockchainId: number;
  ticketPrice: string;
  startNo: number;
  endNo: number;
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

interface WinnerData {
  address: string;
  amount: string;
}

//   GET ALL RAFFLES
export async function getRaffles() {
  try {
    const raffles = await prisma.raffle.findMany({
      where: {
        endDate: {
          gte: new Date(Date.now()),
        },
      },
    });
    console.log("raffles", raffles);
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

// create raffle
export async function createRaffle(params: Raffle) {
  try {
    const raffle = await prisma.raffle.create({
      data: {
        title: params.title,
        description: params.description,
        expectedWinners: params.expectedWinners,
        winningPrice: params.winningPrice,
        blockchainId: params.blockchainId,
        ticketPrice: params.ticketPrice,
        startNo: params.startNo,
        endNo: params.endNo,
        endDate: params.endDate,
        status: params.status,
        takenNos: JSON.stringify([]),
        chosenData: JSON.stringify([]),
        totalCollected: "0",
        platformFee: "0",
      },
    });

    return raffle;
  } catch (error) {
    console.log("createRaffle error:", error);
    return null;
  }
}

//  GET RAFFLE BY ID

export async function getRaffleById(raffleId: number) {
  try {
    return await prisma.raffle.findUnique({ where: { id: raffleId } });
  } catch (error) {
    console.log("getRaffleById error:", error);
    return null;
  }
}

// BUY RAFFLE TICKET

export async function buyRaffleTicket(params: BuyRaffle) {
  try {
    // ========== 1. REGISTER USER IF NOT FOUND ==========
    const walletRegistered = await checkWallet(params.address);
    if (!walletRegistered) {
      await prisma.user.create({
        data: {
          address: params.address,
          raffleIds: JSON.stringify([]),
        },
      });
    }

    // ========== 2. GET RAFFLE ==========
    const raffle = await getRaffleById(params.raffleId);
    if (!raffle) return null;

    // --- existing data ---
    const existingTakenNos = raffle.takenNos ? JSON.parse(raffle.takenNos) : [];
    const existingChosenData = raffle.chosenData
      ? JSON.parse(raffle.chosenData)
      : [];

    // merge taken numbers
    const updatedTakenNos = Array.from(
      new Set([...existingTakenNos, ...params.selectedNos])
    );

    // merge chosenData
    const buyerIndex = existingChosenData.findIndex(
      (c: any) => c.buyer === params.address
    );

    if (buyerIndex === -1) {
      // user not present → add new entry
      existingChosenData.push({
        buyer: params.address,
        numbers: params.selectedNos,
      });
    } else {
      // user exists → merge numbers into existing record
      const oldNumbers = existingChosenData[buyerIndex].numbers;
      const mergedNumbers = Array.from(
        new Set([...oldNumbers, ...params.selectedNos])
      );
      existingChosenData[buyerIndex].numbers = mergedNumbers;
    }

    // ========== 3. UPDATE RAFFLE ==========
    const updatedRaffle = await prisma.raffle.update({
      where: { id: params.raffleId },
      data: {
        takenNos: JSON.stringify(updatedTakenNos),
        chosenData: JSON.stringify(existingChosenData),
      },
    });

    // ========== 4. UPDATE USER'S RAFFLE IDS ==========
    const user = await prisma.user.findUnique({
      where: { address: params.address },
    });

    let raffleTrack = user?.raffleIds ? JSON.parse(user.raffleIds) : [];

    const index = raffleTrack.findIndex(
      (r: any) => r.raffleId === params.raffleId
    );

    if (index === -1) {
      // new raffle entry
      raffleTrack.push({
        raffleId: params.raffleId,
        numbers: params.selectedNos,
      });
    } else {
      // update existing raffle entry → merge numbers
      const mergedNumbers = Array.from(
        new Set([...raffleTrack[index].numbers, ...params.selectedNos])
      );
      raffleTrack[index].numbers = mergedNumbers;
    }

    await prisma.user.update({
      where: { address: params.address },
      data: { raffleIds: JSON.stringify(raffleTrack) },
    });

    // ========== 5. UPDATE OR CREATE USER TICKET ==========
    const existingTicket = await prisma.ticket.findUnique({
      where: {
        raffleId_userAddress: {
          raffleId: params.raffleId,
          userAddress: params.address,
        },
      },
    });

    const newNumberSet = existingTicket
      ? Array.from(
          new Set([
            ...JSON.parse(existingTicket.selectedNumbers),
            ...params.selectedNos,
          ])
        )
      : params.selectedNos;

    if (!existingTicket) {
      // create fresh ticket
      await prisma.ticket.create({
        data: {
          raffleId: params.raffleId,
          userAddress: params.address,
          selectedNumbers: JSON.stringify(newNumberSet),
          amountPaid: "0", // you can update later if needed
        },
      });
    } else {
      // update existing ticket
      await prisma.ticket.update({
        where: {
          raffleId_userAddress: {
            raffleId: params.raffleId,
            userAddress: params.address,
          },
        },
        data: {
          selectedNumbers: JSON.stringify(newNumberSet),
        },
      });
    }

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
        purchaseDate: raffle.endDate,
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
        purchaseDate: raffle.endDate,
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
        endDate: { lt: new Date() },
      },
      orderBy: { endDate: "desc" },
    });

    const winners = [];

    for (const raffle of raffles) {
      // Pull actual winners from the blockchain
      const realWinners = await getWinnersFromContract(raffle.blockchainId);

      if (!realWinners || realWinners.length === 0) continue;

      for (const winner of realWinners) {
        winners.push({
          id: `${raffle.id}-${winner.address}`,
          raffleId: raffle.id,
          raffleName: raffle.title,
          winner: `${winner.address.slice(0, 6)}...${winner.address.slice(-4)}`,
          walletAddress: winner.address,
          winningNumbers: winner.numbers,
          amount: (Number(winner.amount) / 1e18).toString(),
          date: new Date(raffle.endDate).toISOString().split("T")[0],
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
        totalWagered: "0",
        totalWinnings: "0",
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
      totalWagered: "0",
      totalWinnings: "0",
      ticketsWon: 0,
      ticketsLost: 0,
    };
  }
}

// Record winners in database
export async function saveWinnersToDatabase(
  raffleId: number,
  winners: { address: string; numbers: number[]; amount: string }[],
  transactionHash: string
): Promise<boolean> {
  try {

    // Verify raffle exists
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle) {
      console.error(`❌ Raffle ${raffleId} not found in database`);
      return false;
    }

    // Save each winner
    let savedCount = 0;
    for (const winner of winners) {
      try {
        await prisma.winner.upsert({
          where: {
            raffleId_userAddress: {
              raffleId: raffleId,
              userAddress: winner.address,
            },
          },
          update: {
            winningNumbers: JSON.stringify(winner.numbers),
            amountWon: winner.amount,
            transactionHash: transactionHash,
          },
          create: {
            raffleId: raffleId,
            userAddress: winner.address,
            winningNumbers: JSON.stringify(winner.numbers),
            amountWon: winner.amount,
            transactionHash: transactionHash,
          },
        });

        savedCount++;
        console.log(
          `   ✅ Saved winner ${savedCount}/${winners.length}: ${winner.address}`
        );
      } catch (err) {
        console.error(`   ❌ Failed to save winner ${winner.address}:`, err);
      }
    }

    if (savedCount === 0) {
      console.error("❌ Failed to save any winners");
      return false;
    }

    // Update raffle status to closed
    await prisma.raffle.update({
      where: { id: raffleId },
      data: { status: "closed" },
    });

    console.log(
      `✅ Raffle ${raffleId} marked as closed. Saved ${savedCount}/${winners.length} winners.`
    );
    return true;
  } catch (error) {
    console.error("❌ Error saving winners to database:", error);
    console.error("Error details:", error);
    return false;
  }
}

// Get winners for a raffle
export async function getRaffleWinners(raffleId: number) {
  try {
    const winners = await prisma.winner.findMany({
      where: { raffleId },
      include: {
        raffle: true,
      },
    });

    return winners.map((w) => ({
      id: w.id,
      raffleId: w.raffleId,
      raffleName: w.raffle.title,
      userAddress: w.userAddress,
      winningNumbers: JSON.parse(w.winningNumbers),
      amountWon: w.amountWon,
      transactionHash: w.transactionHash,
      createdAt: w.createdAt,
    }));
  } catch (error) {
    console.log("getRaffleWinners error:", error);
    return [];
  }
}

// Get all winners across all raffles
export async function getAllWinners(limit: number = 100) {
  try {
    const winners = await prisma.winner.findMany({
      include: {
        raffle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return winners.map((w) => ({
      id: w.id,
      raffleId: w.raffleId,
      raffleName: w.raffle.title,
      userAddress: w.userAddress,
      winningNumbers: JSON.parse(w.winningNumbers),
      amountWon: w.amountWon,
      transactionHash: w.transactionHash,
      createdAt: w.createdAt,
    }));
  } catch (error) {
    console.log("getAllWinners error:", error);
    return [];
  }
}

// Get user's winning tickets
export async function getUserWinnings(userAddress: string) {
  try {
    const winnings = await prisma.winner.findMany({
      where: {
        userAddress: userAddress.toLowerCase(),
      },
      include: {
        raffle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return winnings.map((w) => ({
      id: w.id,
      raffleId: w.raffleId,
      raffleName: w.raffle.title,
      winningNumbers: JSON.parse(w.winningNumbers),
      amountWon: w.amountWon,
      transactionHash: w.transactionHash,
      createdAt: w.createdAt,
    }));
  } catch (error) {
    console.log("getUserWinnings error:", error);
    return [];
  }
}

// Update user's winning status
export async function updateUserWinningStatus(
  raffleId: number,
  winnerAddresses: string[]
): Promise<void> {
  try {

    let updatedCount = 0;
    for (const address of winnerAddresses) {
      try {
        const user = await prisma.user.findUnique({
          where: { address: address.toLowerCase() },
        });

        if (!user) {
          console.log(`   ⚠️ User ${address} not found in database`);
          continue;
        }

        if (!user.raffleIds) {
          console.log(`   ⚠️ User ${address} has no raffleIds`);
          continue;
        }

        const raffleIds = JSON.parse(user.raffleIds);

        // Update status to 'won' for this raffle
        const updatedRaffleIds = raffleIds.map((item: any) => ({
          ...item,
          status: item.raffleId === raffleId ? "won" : item.status || "active",
        }));

        await prisma.user.update({
          where: { address: address.toLowerCase() },
          data: {
            raffleIds: JSON.stringify(updatedRaffleIds),
          },
        });

        updatedCount++;
      } catch (err) {
        console.error(`   ❌ Failed to update user ${address}:`, err);
      }
    }

    console.log(`✅ Updated ${updatedCount}/${winnerAddresses.length} users' winning status`);
  } catch (error) {
    console.error("❌ Error updating user winning status:", error);
  }
}

// checking the raffles that are past end date
export async function checkEndDate(): Promise<raffleType[] | null> {
  try {
    // get the raffles
    const raffles = await prisma.raffle.findMany({
      where: {
        endDate: {
          lte: new Date(Date.now()),
        },
      },
    });
    if (!raffles) {
      return null;
    }

    return raffles;
  } catch (error) {
    console.error("Unable to get the raffles.");
    return null;
  }
}

// function to update a refund state to a raffle
export async function setRefunded(raffleId: number): Promise<boolean> {
  try {
    await prisma.raffle.update({
      where: { id: raffleId },
      data: { status: "refunded" },
    });

    console.log(`✅ Raffle ${raffleId} marked as refunded`);
    return true;
  } catch (error) {
    console.error(`❌ Error marking raffle ${raffleId} as refunded:`, error);
    return false;
  }
}
