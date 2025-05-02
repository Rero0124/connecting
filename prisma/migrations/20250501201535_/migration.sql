/*
  Warnings:

  - You are about to drop the column `profile_data` on the `dm_session` table. All the data in the column will be lost.
  - You are about to drop the column `profile_type` on the `dm_session` table. All the data in the column will be lost.
  - You are about to drop the column `profile_data` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `profile_type` on the `room` table. All the data in the column will be lost.
  - Added the required column `icon_data` to the `dm_session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon_type` to the `dm_session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon_data` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon_type` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dm_session" DROP COLUMN "profile_data",
DROP COLUMN "profile_type",
ADD COLUMN     "icon_data" TEXT NOT NULL,
ADD COLUMN     "icon_type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "room" DROP COLUMN "profile_data",
DROP COLUMN "profile_type",
ADD COLUMN     "icon_data" TEXT NOT NULL,
ADD COLUMN     "icon_type" TEXT NOT NULL;
