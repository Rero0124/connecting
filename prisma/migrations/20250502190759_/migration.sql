-- AlterTable
ALTER TABLE "dm_message" ALTER COLUMN "content_type" SET DEFAULT 'text',
ALTER COLUMN "is_pinned" SET DEFAULT false;

-- AlterTable
ALTER TABLE "room_message" ALTER COLUMN "content_type" SET DEFAULT 'text',
ALTER COLUMN "is_pinned" SET DEFAULT false;
