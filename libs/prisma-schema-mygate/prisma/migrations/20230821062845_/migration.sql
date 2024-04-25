/*
  Warnings:

  - You are about to drop the column `access_display` on the `device_cards` table. All the data in the column will be lost.
  - You are about to drop the `s_m_cards` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[device_id,card_id]` on the table `device_cards` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[device_id,access_ref_id]` on the table `mygate_cards` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[device_id,sync_token]` on the table `sync_messages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `card_id` to the `device_cards` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `device_id` on the `mygate_cards` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SyncMessageCardAction" AS ENUM ('ADD', 'REMOVE');

-- DropForeignKey
ALTER TABLE "mygate_cards" DROP CONSTRAINT "mygate_cards_device_id_fkey";

-- DropForeignKey
ALTER TABLE "s_m_cards" DROP CONSTRAINT "s_m_cards_s_m_id_fkey";

-- AlterTable
ALTER TABLE "device_cards" DROP COLUMN "access_display",
ADD COLUMN     "card_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "mygate_cards" DROP COLUMN "device_id",
ADD COLUMN     "device_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sync_messages" ALTER COLUMN "sync_token" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "s_m_cards";

-- CreateTable
CREATE TABLE "sync_message_cards" (
    "id" SERIAL NOT NULL,
    "sync_message_id" INTEGER NOT NULL,
    "access_display" TEXT NOT NULL,
    "status" "SyncMessageCardAction" NOT NULL,

    CONSTRAINT "sync_message_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_cards_device_id_card_id_key" ON "device_cards"("device_id", "card_id");

-- CreateIndex
CREATE UNIQUE INDEX "mygate_cards_device_id_access_ref_id_key" ON "mygate_cards"("device_id", "access_ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "sync_messages_device_id_sync_token_key" ON "sync_messages"("device_id", "sync_token");

-- AddForeignKey
ALTER TABLE "mygate_cards" ADD CONSTRAINT "mygate_cards_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_message_cards" ADD CONSTRAINT "sync_message_cards_sync_message_id_fkey" FOREIGN KEY ("sync_message_id") REFERENCES "sync_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_cards" ADD CONSTRAINT "device_cards_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
