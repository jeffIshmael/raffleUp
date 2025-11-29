/*
  Warnings:

  - You are about to drop the column `takenNo` on the `Raffle` table. All the data in the column will be lost.
  - Added the required column `status` to the `Raffle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Raffle" DROP COLUMN "takenNo",
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "takenNos" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "raffleIds" DROP NOT NULL;
