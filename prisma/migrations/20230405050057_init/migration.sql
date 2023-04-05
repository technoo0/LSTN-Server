-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_spotifyTokensId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "spotifyTokensId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_spotifyTokensId_fkey" FOREIGN KEY ("spotifyTokensId") REFERENCES "SpotifyToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
