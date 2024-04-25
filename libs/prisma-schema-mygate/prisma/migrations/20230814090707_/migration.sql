-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "device_key" TEXT;

-- CreateTable
CREATE TABLE "i_am_here_logs" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,

    CONSTRAINT "i_am_here_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_ack_logs" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,

    CONSTRAINT "sync_ack_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "i_am_here_logs" ADD CONSTRAINT "i_am_here_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_ack_logs" ADD CONSTRAINT "sync_ack_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
