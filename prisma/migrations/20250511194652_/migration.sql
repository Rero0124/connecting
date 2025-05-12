/*
  Warnings:

  - Added the required column `room_channel_id` to the `room_message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('text', 'voice');

-- DropIndex
DROP INDEX "room_message_room_id_is_pinned_idx";

-- AlterTable
ALTER TABLE "room_message" ADD COLUMN     "room_channel_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "room_channel" (
    "id" SERIAL NOT NULL,
    "room_id" VARCHAR(25) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "ChannelType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "room_channel_room_id_idx" ON "room_channel"("room_id");

-- CreateIndex
CREATE INDEX "room_channel_name_idx" ON "room_channel"("name");

-- CreateIndex
CREATE INDEX "room_message_room_id_room_channel_id_is_pinned_idx" ON "room_message"("room_id", "room_channel_id", "is_pinned");

-- CreateIndex
CREATE INDEX "room_message_room_id_room_channel_id_idx" ON "room_message"("room_id", "room_channel_id");

-- AddForeignKey
ALTER TABLE "room_channel" ADD CONSTRAINT "room_channel_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_message" ADD CONSTRAINT "room_message_room_channel_id_fkey" FOREIGN KEY ("room_channel_id") REFERENCES "room_channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
