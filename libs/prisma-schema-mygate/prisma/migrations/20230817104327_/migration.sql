/*
  Warnings:

  - The `timestamp` column on the `i_am_here_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "i_am_here_logs" DROP COLUMN "timestamp",
ADD COLUMN     "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
