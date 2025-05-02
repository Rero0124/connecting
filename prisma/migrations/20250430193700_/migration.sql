/*
  Warnings:

  - Added the required column `statusType` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "statusType" CHAR(6) NOT NULL;
