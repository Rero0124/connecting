/*
  Warnings:

  - Added the required column `profile_data` to the `message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_type` to the `message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_data` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_type` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message" ADD COLUMN     "profile_data" TEXT NOT NULL,
ADD COLUMN     "profile_type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "room" ADD COLUMN     "profile_data" TEXT NOT NULL,
ADD COLUMN     "profile_type" TEXT NOT NULL;
