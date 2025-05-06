/*
  Warnings:

  - The `content_type` column on the `dm_message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `statusType` on the `profile` table. All the data in the column will be lost.
  - The `content_type` column on the `room_message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `status_type` to the `deleted_profile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `icon_type` on the `dm_session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `filter_type` on the `filter_user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `status_type` to the `profile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `icon_type` on the `room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('common', 'custom');

-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('block', 'hidden');

-- CreateEnum
CREATE TYPE "IconType" AS ENUM ('text', 'image');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('text', 'calling');

-- AlterTable
ALTER TABLE "deleted_profile" ADD COLUMN     "status_type" "StatusType" NOT NULL;

-- AlterTable
ALTER TABLE "dm_message" DROP COLUMN "content_type",
ADD COLUMN     "content_type" "ContentType" NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE "dm_session" DROP COLUMN "icon_type",
ADD COLUMN     "icon_type" "IconType" NOT NULL;

-- AlterTable
ALTER TABLE "filter_user" DROP COLUMN "filter_type",
ADD COLUMN     "filter_type" "FilterType" NOT NULL;

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "statusType",
ADD COLUMN     "status_type" "StatusType" NOT NULL;

-- AlterTable
ALTER TABLE "room" DROP COLUMN "icon_type",
ADD COLUMN     "icon_type" "IconType" NOT NULL;

-- AlterTable
ALTER TABLE "room_message" DROP COLUMN "content_type",
ADD COLUMN     "content_type" "ContentType" NOT NULL DEFAULT 'text';

-- CreateIndex
CREATE UNIQUE INDEX "filter_user_profile_id_filter_profile_id_filter_type_key" ON "filter_user"("profile_id", "filter_profile_id", "filter_type");
