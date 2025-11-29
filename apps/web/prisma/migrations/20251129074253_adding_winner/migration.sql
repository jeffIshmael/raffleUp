/*
  Warnings:

  - You are about to drop the `Raffle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Raffle";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "raffleIds" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raffles" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "expectedWinners" INTEGER NOT NULL,
    "winningPrice" TEXT NOT NULL,
    "blockchainId" INTEGER NOT NULL,
    "ticketPrice" TEXT NOT NULL,
    "startNo" INTEGER NOT NULL,
    "endNo" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "takenNos" TEXT,
    "chosenData" TEXT,
    "totalCollected" TEXT,
    "platformFee" TEXT,

    CONSTRAINT "raffles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "raffleId" INTEGER NOT NULL,
    "userAddress" TEXT NOT NULL,
    "selectedNumbers" TEXT NOT NULL,
    "amountPaid" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winners" (
    "id" SERIAL NOT NULL,
    "raffleId" INTEGER NOT NULL,
    "userAddress" TEXT NOT NULL,
    "winningNumbers" TEXT NOT NULL,
    "amountWon" TEXT NOT NULL,
    "transactionHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_address_key" ON "users"("address");

-- CreateIndex
CREATE UNIQUE INDEX "raffles_blockchainId_key" ON "raffles"("blockchainId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_raffleId_userAddress_key" ON "tickets"("raffleId", "userAddress");

-- CreateIndex
CREATE UNIQUE INDEX "winners_raffleId_userAddress_key" ON "winners"("raffleId", "userAddress");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "users"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "users"("address") ON DELETE CASCADE ON UPDATE CASCADE;
