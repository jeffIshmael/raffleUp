/*
  Warnings:

  - You are about to drop the column `buyerId` on the `Raffle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Raffle" DROP CONSTRAINT "Raffle_buyerId_fkey";

-- AlterTable
ALTER TABLE "Raffle" DROP COLUMN "buyerId";
