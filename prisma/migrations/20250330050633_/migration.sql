-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_master_id_fkey";

-- DropForeignKey
ALTER TABLE "room_user" DROP CONSTRAINT "room_user_room_id_fkey";

-- DropForeignKey
ALTER TABLE "room_user" DROP CONSTRAINT "room_user_user_id_fkey";

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_master_id_fkey" FOREIGN KEY ("master_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_user" ADD CONSTRAINT "room_user_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_user" ADD CONSTRAINT "room_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
