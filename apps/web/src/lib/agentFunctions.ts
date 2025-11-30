// this file contains the agent smart contract function
//  i.e trigger close raffle function, trigger refund function
"use server";
import { raffleUpAbi, raffleUpAddress } from "@/Constants/constants";

import { celoSepolia } from "viem/chains";
import { createPublicClient, createWalletClient, http } from "viem";

import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.AGENT_PRIVATE_KEY) {
  throw Error("agent private key is not set.");
}

const agentAccount = privateKeyToAccount(
  process.env.AGENT_PRIVATE_KEY as `0x${string}`
);

const publicClient = createPublicClient({
  chain: celoSepolia,
  transport: http(),
});

const agentWalletClient = createWalletClient({
  chain: celoSepolia,
  transport: http(),
  account: agentAccount,
});

interface WinnerInfo {
  winnerAddress: string;
  winningNumbers: bigint[];
  amountWon: bigint;
}

// function to get the total numbers of raffle
export async function totalRaffles(): Promise<number | null> {
  try {
    const total = await publicClient.readContract({
      address: raffleUpAddress,
      abi: raffleUpAbi,
      functionName: "raffleCount",
    });
    return Number(total);
  } catch (error) {
    console.error("error getting total raffles", error);
    return null;
  }
}

// getting winners
export async function getWinnersFromContract(
  raffleBlockchainId: number
): Promise<{ address: string; numbers: number[]; amount: string }[] | null> {
  try {
    // Call the new smart contract function that returns everything
    const winnersData = (await publicClient.readContract({
      address: raffleUpAddress,
      abi: raffleUpAbi,
      functionName: "getWinnersWithNumbers",
      args: [BigInt(raffleBlockchainId)],
    })) as WinnerInfo[];

    if (!winnersData || winnersData.length === 0) {
      console.log("No winners found");
      return null;
    }

    // Group by address to handle multiple wins
    const winnerMap = new Map<
      string,
      { numbers: Set<number>; totalAmount: bigint }
    >();

    for (const winner of winnersData) {
      const address = winner.winnerAddress.toLowerCase();
      const amount = BigInt(winner.amountWon);

      if (!winnerMap.has(address)) {
        winnerMap.set(address, { numbers: new Set(), totalAmount: 0n });
      }

      const data = winnerMap.get(address)!;

      // Add winning numbers
      for (const num of winner.winningNumbers) {
        data.numbers.add(Number(num));
      }

      // Add to total amount
      data.totalAmount += amount;
    }

    // Convert to result array
    const result = Array.from(winnerMap.entries()).map(([address, data]) => ({
      address: address,
      numbers: Array.from(data.numbers).sort((a, b) => a - b),
      amount: data.totalAmount.toString(),
    }));

    console.log(`Found ${result.length} unique winners`);
    result.forEach((w) => {
      console.log(
        `   - ${w.address}: numbers [${w.numbers.join(", ")}] = ${w.amount} wei`
      );
    });

    return result;
  } catch (error) {
    console.error("Error fetching winners from contract:", error);
    return null;
  }
}

// trigger close function
export async function triggerCloseRaffle(
  raffleBlockchainId: number
): Promise<string | null> {
  try {
    const { request } = await publicClient.simulateContract({
      address: raffleUpAddress,
      abi: raffleUpAbi,
      functionName: "closeRaffle",
      args: [BigInt(raffleBlockchainId)],
      account: agentAccount,
    });
    const hash = await agentWalletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    if (receipt.status == "reverted") {
      return null;
    }
    return receipt.transactionHash;
  } catch (error) {
    console.error("Error happened while closing raffle", error);
    return null;
  }
}

// trigger refund raffle :- if only 1 entry
export async function triggerRefundRaffle(
  raffleBlockchainId: number
): Promise<string | null> {
  try {
    const { request } = await publicClient.simulateContract({
      address: raffleUpAddress,
      abi: raffleUpAbi,
      functionName: "refundRaffle",
      args: [BigInt(raffleBlockchainId)],
      account: agentAccount,
    });
    const hash = await agentWalletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    if (receipt.status == "reverted") {
      return null;
    }
    return receipt.transactionHash;
  } catch (error) {
    console.error("Error happened while closing raffle", error);
    return null;
  }
}
