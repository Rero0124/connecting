/*
  Warnings:

  - The primary key for the `room_join_code` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[code]` on the table `room_join_code` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "room_join_code" DROP CONSTRAINT "room_join_code_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "room_join_code_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "room_join_code_code_key" ON "room_join_code"("code");

-- CreateIndex
CREATE INDEX "room_join_code_code_room_id_idx" ON "room_join_code"("code", "room_id");
