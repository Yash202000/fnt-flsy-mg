-- AlterTable
ALTER TABLE "mygate_logs" ADD COLUMN     "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_notified_to_mygate" BOOLEAN,
ADD COLUMN     "mygate_response" JSONB,
ADD COLUMN     "is_notified_to_mygate_successfully" BOOLEAN,
ADD COLUMN     "mygate_response_timestamp" TIMESTAMP(3);
