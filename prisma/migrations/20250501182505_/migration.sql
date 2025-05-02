-- AlterTable
ALTER TABLE "room_join_code" ALTER COLUMN "room_id" SET DATA TYPE VARCHAR(25);

-- AddForeignKey
ALTER TABLE "room_join_code" ADD CONSTRAINT "room_join_code_author_profile_id_fkey" FOREIGN KEY ("author_profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_join_code" ADD CONSTRAINT "room_join_code_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
