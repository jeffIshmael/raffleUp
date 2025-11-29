"use server";
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

export { publicClient, agentWalletClient, agentAccount };
