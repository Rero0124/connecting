/*
  Warnings:

  - You are about to drop the column `master_id` on the `room` table. All the data in the column will be lost.
  - The primary key for the `user_profile_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tmeout` on the `user_profile_status` table. All the data in the column will be lost.
  - You are about to drop the `add_friends` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `room_chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `room_user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_friends` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,user_id]` on the table `user_profile_status` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `master_profile_id` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "add_friends" DROP CONSTRAINT "add_friends_friend_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "add_friends" DROP CONSTRAINT "add_friends_user_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "filter_user" DROP CONSTRAINT "filter_user_filter_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "filter_user" DROP CONSTRAINT "filter_user_user_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "message_chat" DROP CONSTRAINT "message_chat_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_chat" DROP CONSTRAINT "message_chat_sended_user_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "message_user" DROP CONSTRAINT "message_user_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_user" DROP CONSTRAINT "message_user_user_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_master_id_fkey";

-- DropForeignKey
ALTER TABLE "room_chat" DROP CONSTRAINT "room_chat_room_id_fkey";

-- DropForeignKey
ALTER TABLE "room_chat" DROP CONSTRAINT "room_chat_sended_user_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "room_user" DROP CONSTRAINT "room_user_room_id_fkey";

-- DropForeignKey
ALTER TABLE "room_user" DROP CONSTRAINT "room_user_user_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "user_friends" DROP CONSTRAINT "user_friends_friend_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "user_friends" DROP CONSTRAINT "user_friends_user_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_user_id_fkey";

-- AlterTable
ALTER TABLE "room" DROP COLUMN "master_id",
ADD COLUMN     "master_profile_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_profile_status" DROP CONSTRAINT "user_profile_status_pkey",
DROP COLUMN "tmeout",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "timeout" INTEGER NOT NULL DEFAULT -1,
ADD CONSTRAINT "user_profile_status_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "add_friends";

-- DropTable
DROP TABLE "message";

-- DropTable
DROP TABLE "message_chat";

-- DropTable
DROP TABLE "message_user";

-- DropTable
DROP TABLE "room_chat";

-- DropTable
DROP TABLE "room_user";

-- DropTable
DROP TABLE "user_friends";

-- DropTable
DROP TABLE "user_profile";

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "user_tag" TEXT NOT NULL,
    "user_name" VARCHAR(100),
    "information" VARCHAR(255) NOT NULL,
    "image" TEXT NOT NULL DEFAULT '/public/image/profile/default.jpg',
    "is_company" BOOLEAN NOT NULL DEFAULT false,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deleted_profile" (
    "id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "user_tag" TEXT NOT NULL,
    "user_name" VARCHAR(100),
    "information" VARCHAR(255) NOT NULL,
    "image" TEXT NOT NULL,
    "is_company" BOOLEAN NOT NULL,
    "is_online" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deleted_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "friend_profile_id" INTEGER NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_request" (
    "id" SERIAL NOT NULL,
    "user_profile_id" INTEGER NOT NULL,
    "friend_profile_id" INTEGER NOT NULL,

    CONSTRAINT "friend_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dm_session" (
    "id" VARCHAR(25) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "profile_type" TEXT NOT NULL,
    "profile_data" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dm_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dm_participant" (
    "id" SERIAL NOT NULL,
    "dm_session_id" VARCHAR(25) NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_not_allowed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "dm_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dm_message" (
    "id" SERIAL NOT NULL,
    "dm_session_id" VARCHAR(25) NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL,
    "sended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "dm_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_participant" (
    "id" SERIAL NOT NULL,
    "room_id" VARCHAR(25) NOT NULL,
    "user_profile_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_message" (
    "id" SERIAL NOT NULL,
    "room_id" VARCHAR(25) NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL,
    "sended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_edited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "room_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_tag_key" ON "profile"("user_tag");

-- CreateIndex
CREATE INDEX "profile_user_id_idx" ON "profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_is_company_user_name_key" ON "profile"("user_id", "is_company", "user_name");

-- CreateIndex
CREATE UNIQUE INDEX "deleted_profile_user_tag_key" ON "deleted_profile"("user_tag");

-- CreateIndex
CREATE INDEX "deleted_profile_user_id_idx" ON "deleted_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "deleted_profile_user_id_is_company_user_name_key" ON "deleted_profile"("user_id", "is_company", "user_name");

-- CreateIndex
CREATE INDEX "friend_profile_id_idx" ON "friend"("profile_id");

-- CreateIndex
CREATE INDEX "friend_friend_profile_id_idx" ON "friend"("friend_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "friend_profile_id_friend_profile_id_key" ON "friend"("profile_id", "friend_profile_id");

-- CreateIndex
CREATE INDEX "friend_request_user_profile_id_idx" ON "friend_request"("user_profile_id");

-- CreateIndex
CREATE INDEX "friend_request_friend_profile_id_idx" ON "friend_request"("friend_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "friend_request_user_profile_id_friend_profile_id_key" ON "friend_request"("user_profile_id", "friend_profile_id");

-- CreateIndex
CREATE INDEX "dm_participant_dm_session_id_idx" ON "dm_participant"("dm_session_id");

-- CreateIndex
CREATE INDEX "dm_participant_profile_id_idx" ON "dm_participant"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "dm_participant_dm_session_id_profile_id_key" ON "dm_participant"("dm_session_id", "profile_id");

-- CreateIndex
CREATE INDEX "dm_message_dm_session_id_is_pinned_idx" ON "dm_message"("dm_session_id", "is_pinned");

-- CreateIndex
CREATE INDEX "dm_message_dm_session_id_idx" ON "dm_message"("dm_session_id");

-- CreateIndex
CREATE INDEX "dm_message_sended_at_idx" ON "dm_message"("sended_at");

-- CreateIndex
CREATE INDEX "room_participant_user_profile_id_idx" ON "room_participant"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_participant_room_id_user_profile_id_key" ON "room_participant"("room_id", "user_profile_id");

-- CreateIndex
CREATE INDEX "room_message_room_id_is_pinned_idx" ON "room_message"("room_id", "is_pinned");

-- CreateIndex
CREATE INDEX "room_message_room_id_idx" ON "room_message"("room_id");

-- CreateIndex
CREATE INDEX "room_message_sended_at_idx" ON "room_message"("sended_at");

-- CreateIndex
CREATE INDEX "room_name_idx" ON "room"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_status_name_user_id_key" ON "user_profile_status"("name", "user_id");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filter_user" ADD CONSTRAINT "filter_user_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filter_user" ADD CONSTRAINT "filter_user_filter_profile_id_fkey" FOREIGN KEY ("filter_profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_friend_profile_id_fkey" FOREIGN KEY ("friend_profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_friend_profile_id_fkey" FOREIGN KEY ("friend_profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dm_participant" ADD CONSTRAINT "dm_participant_dm_session_id_fkey" FOREIGN KEY ("dm_session_id") REFERENCES "dm_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dm_participant" ADD CONSTRAINT "dm_participant_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dm_message" ADD CONSTRAINT "dm_message_dm_session_id_fkey" FOREIGN KEY ("dm_session_id") REFERENCES "dm_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dm_message" ADD CONSTRAINT "dm_message_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_master_profile_id_fkey" FOREIGN KEY ("master_profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_participant" ADD CONSTRAINT "room_participant_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_participant" ADD CONSTRAINT "room_participant_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_message" ADD CONSTRAINT "room_message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_message" ADD CONSTRAINT "room_message_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
