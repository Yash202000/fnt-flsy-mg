/*
  Warnings:

  - You are about to drop the column `isMyGateDevice` on the `devices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "devices" DROP COLUMN "isMyGateDevice",
ADD COLUMN     "is_mygate_device" BOOLEAN NOT NULL DEFAULT false;
