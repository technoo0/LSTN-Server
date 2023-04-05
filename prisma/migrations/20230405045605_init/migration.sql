/*
  Warnings:

  - You are about to drop the `SpotifyTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_spotifyTokensId_fkey";

-- DropTable
DROP TABLE "SpotifyTokens";

-- CreateTable
CREATE TABLE "SpotifyToken" (
    "id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_spotifyTokensId_fkey" FOREIGN KEY ("spotifyTokensId") REFERENCES "SpotifyToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
