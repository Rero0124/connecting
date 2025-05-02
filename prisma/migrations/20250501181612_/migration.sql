-- CreateTable
CREATE TABLE "room_join_code" (
    "code" VARCHAR(25) NOT NULL,
    "author_profile_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_join_code_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "room_join_code_room_id_idx" ON "room_join_code"("room_id");
