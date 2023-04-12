-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_fromId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_toId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_spotifyTokensId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_spotifyTokensId_fkey" FOREIGN KEY ("spotifyTokensId") REFERENCES "SpotifyToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
