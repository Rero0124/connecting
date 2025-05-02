/*
  Warnings:

  - You are about to drop the column `user_profile_id` on the `filter_user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profile_id,filter_profile_id,filter_type]` on the table `filter_user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profile_id` to the `filter_user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "filter_user" DROP CONSTRAINT "filter_user_user_profile_id_fkey";

-- DropIndex
DROP INDEX "filter_user_user_profile_id_filter_profile_id_filter_type_key";

-- DropIndex
DROP INDEX "filter_user_user_profile_id_idx";

-- AlterTable
ALTER TABLE "filter_user" DROP COLUMN "user_profile_id",
ADD COLUMN     "profile_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "filter_user_profile_id_idx" ON "filter_user"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "filter_user_profile_id_filter_profile_id_filter_type_key" ON "filter_user"("profile_id", "filter_profile_id", "filter_type");

-- AddForeignKey
ALTER TABLE "filter_user" ADD CONSTRAINT "filter_user_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
