-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "isMyGateDevice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_devicekey_exampt" BOOLEAN NOT NULL DEFAULT false;
