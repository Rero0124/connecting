/*
  Warnings:

  - A unique constraint covering the columns `[user_profile_id,filter_profile_id,filter_type]` on the table `filter_user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "filter_user_user_profile_id_filter_profile_id_key";

-- AlterTable
ALTER TABLE "user_friends" ADD COLUMN     "is_favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "filter_user_user_profile_id_filter_profile_id_filter_type_key" ON "filter_user"("user_profile_id", "filter_profile_id", "filter_type");

-- AddForeignKey
ALTER TABLE "message_chat" ADD CONSTRAINT "message_chat_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_chat" ADD CONSTRAINT "message_chat_sended_user_profile_id_fkey" FOREIGN KEY ("sended_user_profile_id") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_chat" ADD CONSTRAINT "room_chat_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_chat" ADD CONSTRAINT "room_chat_sended_user_profile_id_fkey" FOREIGN KEY ("sended_user_profile_id") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
