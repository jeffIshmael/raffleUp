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

export async function closeRaffle(
  blockchainId: number,
  raffleId: number
): Promise<string | null> {
  try {


    // 1. Execute closeRaffle on blockchain
    const txHash = await triggerCloseRaffle(blockchainId);
    if (!txHash) {
      console.error(" Failed to execute closeRaffle on blockchain");
      return null;
    }

    console.log(`✅ Blockchain transaction successful: ${txHash}`);

    // 2. Fetch winners from contract
    const winners = await getWinnersFromContract(blockchainId);
    if (!winners || winners.length === 0) {
      console.error("❌ No winners returned from contract");
      return null;
    }

    // 3. Save winners to database
    const saved = await saveWinnersToDatabase(raffleId, winners, txHash);
    if (!saved) {
      console.error(" Failed to save winners to database");
      return null;
    }

    // 4. Update user winning status
    await updateUserWinningStatus(
      raffleId,
      winners.map((w) => w.address)
    );

    return txHash;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function refundRaffle(
  blockchainId: number,
  raffleId: number
): Promise<string | null> {
  try {

    // Execute refund on blockchain
    const txHash = await triggerRefundRaffle(blockchainId);
    if (!txHash) {
      console.error(" Failed to execute refund on blockchain");
      return null;
    }


    // Update database
    const updated = await setRefunded(raffleId);
    if (!updated) {
      console.error("Blockchain refunded but database not updated");
    }

    return txHash;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function checkRaffleEndDate(): Promise<void> {
  try {

    const raffles = await checkEndDate();

    if (!raffles || raffles.length === 0) {
      return;
    }

    let processed = 0;
    let failed = 0;

    for (const raffle of raffles) {
      try {
        const entries = raffle.takenNos ? JSON.parse(raffle.takenNos).length : 0;

        if (entries <= 1) {
          const result = await refundRaffle(raffle.blockchainId, raffle.id);
          if (result) processed++;
          else failed++;
        } else {
          const result = await closeRaffle(raffle.blockchainId, raffle.id);
          if (result) processed++;
          else failed++;
        }
      } catch (err) {
        failed++;
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}
