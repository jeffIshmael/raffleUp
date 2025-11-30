import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const RaffleUpModule = buildModule("RaffleUpModule", (m) => {

  // Celo mainnet cUSD:    0x765DE816845861e75A25fCA122bb6898B8B1282a
  // Celo Alfajores cUSD:  0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
  // Celo sepolia cUSD:   0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b

  const cUSD = m.getParameter(
    "cUSD",
    "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b" // default: sepolia
  );

  const agent = m.getParameter(
    "agent",
    "0x1C059486B99d6A2D9372827b70084fbfD014E978" 
  );

  const raffleUp = m.contract("RaffleUp", [cUSD, agent]);

  return { raffleUp };
});

export default RaffleUpModule;



// pnpm hardhat verify \
  // --network sepolia \
  // "0xb7DB97d8A50dCA6Be28AFcB7AB89cb86BCB2FBA0" \
  // "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b" \
  // "0x1C059486B99d6A2D9372827b70084fbfD014E978"