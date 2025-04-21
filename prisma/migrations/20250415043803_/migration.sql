-- CreateTable
CREATE TABLE "add_friends" (
    "id" SERIAL NOT NULL,
    "user_profile_id" INTEGER NOT NULL,
    "friend_profile_id" INTEGER NOT NULL,

    CONSTRAINT "add_friends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "add_friends_user_profile_id_idx" ON "add_friends"("user_profile_id");

-- CreateIndex
CREATE INDEX "add_friends_friend_profile_id_idx" ON "add_friends"("friend_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "add_friends_user_profile_id_friend_profile_id_key" ON "add_friends"("user_profile_id", "friend_profile_id");

-- AddForeignKey
ALTER TABLE "add_friends" ADD CONSTRAINT "add_friends_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "add_friends" ADD CONSTRAINT "add_friends_friend_profile_id_fkey" FOREIGN KEY ("friend_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
