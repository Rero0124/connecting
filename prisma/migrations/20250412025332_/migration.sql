/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `friend_id` on the `user_friends` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `user_friends` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_profile_id,friend_profile_id]` on the table `user_friends` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `friend_profile_id` to the `user_friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_profile_id` to the `user_friends` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_friends" DROP CONSTRAINT "user_friends_friend_id_fkey";

-- DropForeignKey
ALTER TABLE "user_friends" DROP CONSTRAINT "user_friends_user_id_fkey";

-- DropIndex
DROP INDEX "user_friends_user_id_friend_id_key";

-- DropIndex
DROP INDEX "user_friends_user_id_idx";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "user_friends" DROP COLUMN "friend_id",
DROP COLUMN "user_id",
ADD COLUMN     "friend_profile_id" INTEGER NOT NULL,
ADD COLUMN     "user_profile_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "user_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_tag" TEXT NOT NULL,
    "is_company" BOOLEAN NOT NULL DEFAULT false,
    "user_name" VARCHAR(100),
    "status_name" VARCHAR(20) NOT NULL,
    "information" VARCHAR(255) NOT NULL,
    "image" TEXT NOT NULL DEFAULT '/public/image/profile/default.jpg',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_status" (
    "name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_online" BOOLEAN NOT NULL,
    "is_alarm" BOOLEAN NOT NULL,
    "tmeout" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_profile_status_pkey" PRIMARY KEY ("name","user_id")
);

-- CreateIndex
CREATE INDEX "user_profile_user_id_idx" ON "user_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_user_id_is_company_user_name_key" ON "user_profile"("user_id", "is_company", "user_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_user_tag_key" ON "user_profile"("user_tag");

-- CreateIndex
CREATE INDEX "user_profile_status_user_id_idx" ON "user_profile_status"("user_id");

-- CreateIndex
CREATE INDEX "user_friends_user_profile_id_idx" ON "user_friends"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_friends_user_profile_id_friend_profile_id_key" ON "user_friends"("user_profile_id", "friend_profile_id");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_status" ADD CONSTRAINT "user_profile_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_friend_profile_id_fkey" FOREIGN KEY ("friend_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
