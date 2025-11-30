# raffle-up

Raffle Up lets users pick lucky numbers, enter raffles with cUSD, and win transparent, on-chain prizes — all powered by Celo.

A modern Celo blockchain application built with Next.js, TypeScript, and Turborepo.

## 🎯 Overview

**RaffleUp** is a decentralized raffle platform built on the Celo blockchain that brings the excitement of raffles to Web3. Users can:

- 🎫 **Select numbers** in a bus-seat style interface
- 💰 **Purchase tickets** with cUSD (Celo stablecoin)
- 🎲 **Participate** in transparent, on-chain raffles
- 🏆 **Win prizes** with automatic smart contract-based payouts
- 📊 **Track history** of all participations and winnings

All transactions are transparent, immutable, and controlled by audited smart contracts.

---

## ✨ Features

### 🎮 User Features
- ✅ **Wallet Connection** - Connect via MetaMask/Celo Wallet
- ✅ **Number Selection** - Beautiful, interactive bus-seat style grid
- ✅ **Live Raffles** - Browse and join active raffles
- ✅ **Purchase History** - Track all tickets and outcomes
- ✅ **Winnings Dashboard** - View past wins and prizes
- ✅ **Profile Management** - Wallet stats and participation history

### 🎲 Raffle Features
- ✅ **Multiple Raffle Types** - Different price points and pools
- ✅ **Automatic Drawings** - Smart contract-powered winner selection
- ✅ **Transparent Winners** - All past winners visible
- ✅ **Real Payouts** - Instant cUSD distribution to winners
- ✅ **Refund Mechanism** - Automatic refunds for raffles with 1 entry

### 🛡️ Admin Features
- ✅ **Create Raffles** - Full control over raffle parameters
- ✅ **View Analytics** - Track raffle statistics

### 🎨 UI/UX Features
- ✅ **Casino Aesthetic** - Premium dark theme with gold accents
- ✅ **Responsive Design** - Mobile, tablet, and desktop optimized
- ✅ **Loading States** - Beautiful skeleton loaders
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Animations** - Smooth transitions and interactive feedback

---


## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

This is a monorepo managed by Turborepo with the following structure:

- `apps/web` - Next.js application with embedded UI components and utilities
- `apps/hardhat` - Smart contract development environment

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

### Smart Contract Scripts

- `pnpm contracts:compile` - Compile smart contracts
- `pnpm contracts:test` - Run smart contract tests
- `pnpm contracts:deploy` - Deploy contracts to local network
- `pnpm contracts:deploy:alfajores` - Deploy to Celo Alfajores testnet
- `pnpm contracts:deploy:sepolia` - Deploy to Celo Sepolia testnet
- `pnpm contracts:deploy:celo` - Deploy to Celo mainnet

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Smart Contracts**: Hardhat with Viem
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
