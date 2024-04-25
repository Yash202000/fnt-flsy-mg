-- CreateTable
CREATE TABLE "devices" (
    "id" SERIAL NOT NULL,
    "device_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thing_id" TEXT NOT NULL,
    "thing_key" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "last_sync_timestamp" INTEGER NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mygate_cards" (
    "id" SERIAL NOT NULL,
    "access_entity_type" TEXT NOT NULL,
    "access_uuid_type" TEXT NOT NULL,
    "access_ref_id" TEXT NOT NULL,
    "access_uuid" TEXT NOT NULL,
    "access_display" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,

    CONSTRAINT "mygate_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mygate_logs" (
    "id" SERIAL NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "mygate_card_id" INTEGER NOT NULL,

    CONSTRAINT "mygate_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_messages" (
    "id" SERIAL NOT NULL,
    "sync_token" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,

    CONSTRAINT "sync_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "s_m_cards" (
    "id" SERIAL NOT NULL,
    "s_m_id" INTEGER NOT NULL,
    "access_display" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "s_m_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_cards" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "access_display" TEXT NOT NULL,

    CONSTRAINT "device_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_device_id_key" ON "devices"("device_id");

-- AddForeignKey
ALTER TABLE "mygate_cards" ADD CONSTRAINT "mygate_cards_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mygate_logs" ADD CONSTRAINT "mygate_logs_mygate_card_id_fkey" FOREIGN KEY ("mygate_card_id") REFERENCES "mygate_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_messages" ADD CONSTRAINT "sync_messages_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "s_m_cards" ADD CONSTRAINT "s_m_cards_s_m_id_fkey" FOREIGN KEY ("s_m_id") REFERENCES "sync_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
