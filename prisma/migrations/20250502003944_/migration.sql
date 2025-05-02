/*
  Warnings:

  - You are about to drop the column `sended_at` on the `dm_message` table. All the data in the column will be lost.
  - You are about to drop the column `sended_at` on the `room_message` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "dm_message_sended_at_idx";

-- DropIndex
DROP INDEX "room_message_sended_at_idx";

-- AlterTable
ALTER TABLE "dm_message" DROP COLUMN "sended_at",
ADD COLUMN     "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "friend_request" ADD COLUMN     "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "room_message" DROP COLUMN "sended_at",
ADD COLUMN     "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "dm_message_sent_at_idx" ON "dm_message"("sent_at");

-- CreateIndex
CREATE INDEX "room_message_sent_at_idx" ON "room_message"("sent_at");
