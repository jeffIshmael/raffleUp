// this file contains the cronjob that will check for a raffle that is past the draw period and trigger closeRaffle
import {
  checkEndDate,
  saveWinnersToDatabase,
  setRefunded,
  updateUserWinningStatus,
} from "./prismaFunctions";
import {
  triggerRefundRaffle,
  triggerCloseRaffle,
  getWinnersFromContract,
} from "./agentFunctions";

async function closeRaffle(blockchainId: number, raffleId: number) {
  try {
    const txHash = await triggerCloseRaffle(blockchainId);
    if (!txHash) return console.error("Close raffle failed");

    const winners = await getWinnersFromContract(blockchainId);
    if (!winners) return console.error("Unable to fetch winners");

    const saved = await saveWinnersToDatabase(raffleId, winners, txHash);
    if (!saved) return console.error("Failed to save winners");

    await updateUserWinningStatus(
      raffleId,
      winners.map((w) => w.address)
    );

    console.log(`🏆 Raffle ${raffleId} closed`);
    return txHash;
  } catch (err) {
    console.error("Error closing raffle:", err);
  }
}

async function refundRaffle(blockchainId: number, raffleId: number) {
  try {
    const txHash = await triggerRefundRaffle(blockchainId);
    if (!txHash) return console.error(" Refund tx failed");

    await setRefunded(raffleId);
    console.log(`💸 Raffle ${raffleId} refunded`);
    return txHash;
  } catch (err) {
    console.error(" Refund error:", err);
  }
}

export async function checkRaffleEndDate() {
  try {
    const raffles = await checkEndDate();

    if (!raffles || raffles.length === 0) {
      console.log(" No expired raffles to process.");
      return;
    }

    for (const raffle of raffles) {
      const entries = raffle.takenNos ? JSON.parse(raffle.takenNos) : [];

      if (entries.length <= 1) {
        await refundRaffle(raffle.blockchainId, raffle.id);
      } else {
        await closeRaffle(raffle.blockchainId, raffle.id);
      }
    }
  } catch (err) {
    console.error(" Cron logic error:", err);
  }
}
