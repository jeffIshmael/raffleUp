// this file contains the agent smart contract function
//  i.e trigger close raffle function, trigger refund function
import { agentWalletClient, publicClient, agentAccount } from "./agentClient";
import { raffleUpAbi, raffleUpAddress } from "@/Constants/constants";

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
    return hash;
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
      return hash;
    } catch (error) {
      console.error("Error happened while closing raffle", error);
      return null;
    }
  }
  