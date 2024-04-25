/*
  Warnings:

  - You are about to drop the column `is_devicekey_exampt` on the `devices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "devices" DROP COLUMN "is_devicekey_exampt",
ADD COLUMN     "is_device_key_exempt" BOOLEAN NOT NULL DEFAULT false;
