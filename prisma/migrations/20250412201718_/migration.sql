/*
  Warnings:

  - The primary key for the `message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `message` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `VarChar(25)`.
  - You are about to drop the column `user_id` on the `message_user` table. All the data in the column will be lost.
  - You are about to alter the column `message_id` on the `message_user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `VarChar(25)`.
  - The primary key for the `room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `room` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `VarChar(25)`.
  - You are about to drop the column `user_id` on the `room_user` table. All the data in the column will be lost.
  - You are about to alter the column `room_id` on the `room_user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `VarChar(25)`.
  - A unique constraint covering the columns `[message_id,user_profile_id]` on the table `message_user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[room_id,user_profile_id]` on the table `room_user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_profile_id` to the `message_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_profile_id` to the `room_user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "message_user" DROP CONSTRAINT "message_user_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_user" DROP CONSTRAINT "message_user_user_id_fkey";

-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_master_id_fkey";

-- DropForeignKey
ALTER TABLE "room_user" DROP CONSTRAINT "room_user_room_id_fkey";

-- DropForeignKey
ALTER TABLE "room_user" DROP CONSTRAINT "room_user_user_id_fkey";

-- DropIndex
DROP INDEX "message_user_message_id_user_id_key";

-- DropIndex
DROP INDEX "room_user_room_id_user_id_key";

-- AlterTable
ALTER TABLE "message" DROP CONSTRAINT "message_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(25),
ADD CONSTRAINT "message_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "message_user" DROP COLUMN "user_id",
ADD COLUMN     "user_profile_id" INTEGER NOT NULL,
ALTER COLUMN "message_id" SET DATA TYPE VARCHAR(25);

-- AlterTable
ALTER TABLE "room" DROP CONSTRAINT "room_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(25),
ADD CONSTRAINT "room_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "room_user" DROP COLUMN "user_id",
ADD COLUMN     "user_profile_id" INTEGER NOT NULL,
ALTER COLUMN "room_id" SET DATA TYPE VARCHAR(25);

-- AlterTable
ALTER TABLE "user_profile" ADD COLUMN     "is_online" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status_name" DROP NOT NULL,
ALTER COLUMN "information" DROP NOT NULL;

-- CreateTable
CREATE TABLE "filter_user" (
    "id" SERIAL NOT NULL,
    "user_profile_id" INTEGER NOT NULL,
    "filter_profile_id" INTEGER NOT NULL,
    "filter_type" TEXT NOT NULL,

    CONSTRAINT "filter_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_chat" (
    "id" SERIAL NOT NULL,
    "message_id" VARCHAR(25) NOT NULL,
    "sended_user_profile_id" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL,
    "sended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_chat" (
    "id" SERIAL NOT NULL,
    "room_id" VARCHAR(25) NOT NULL,
    "sended_user_profile_id" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL,
    "sended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "filter_user_user_profile_id_idx" ON "filter_user"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "filter_user_user_profile_id_filter_profile_id_key" ON "filter_user"("user_profile_id", "filter_profile_id");

-- CreateIndex
CREATE INDEX "message_chat_message_id_is_pinned_idx" ON "message_chat"("message_id", "is_pinned");

-- CreateIndex
CREATE INDEX "message_chat_message_id_idx" ON "message_chat"("message_id");

-- CreateIndex
CREATE INDEX "message_chat_sended_at_idx" ON "message_chat"("sended_at");

-- CreateIndex
CREATE INDEX "room_chat_room_id_is_pinned_idx" ON "room_chat"("room_id", "is_pinned");

-- CreateIndex
CREATE INDEX "room_chat_room_id_idx" ON "room_chat"("room_id");

-- CreateIndex
CREATE INDEX "room_chat_sended_at_idx" ON "room_chat"("sended_at");

-- CreateIndex
CREATE INDEX "message_user_user_profile_id_idx" ON "message_user"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_user_message_id_user_profile_id_key" ON "message_user"("message_id", "user_profile_id");

-- CreateIndex
CREATE INDEX "room_user_user_profile_id_idx" ON "room_user"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_user_room_id_user_profile_id_key" ON "room_user"("room_id", "user_profile_id");

-- AddForeignKey
ALTER TABLE "filter_user" ADD CONSTRAINT "filter_user_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filter_user" ADD CONSTRAINT "filter_user_filter_profile_id_fkey" FOREIGN KEY ("filter_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_user" ADD CONSTRAINT "message_user_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_user" ADD CONSTRAINT "message_user_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_master_id_fkey" FOREIGN KEY ("master_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_user" ADD CONSTRAINT "room_user_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_user" ADD CONSTRAINT "room_user_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
