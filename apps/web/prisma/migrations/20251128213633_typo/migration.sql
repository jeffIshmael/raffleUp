/*
  Warnings:

  - You are about to drop the column `expectedWinnners` on the `Raffle` table. All the data in the column will be lost.
  - Added the required column `expectedWinners` to the `Raffle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Raffle" DROP COLUMN "expectedWinnners",
ADD COLUMN     "expectedWinners" INTEGER NOT NULL;
