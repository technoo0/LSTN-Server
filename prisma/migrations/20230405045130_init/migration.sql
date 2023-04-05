/*
  Warnings:

  - You are about to drop the column `spotifyId` on the `User` table. All the data in the column will be lost.
  - Added the required column `spotifyTokensId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_spotifyId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "spotifyId",
ADD COLUMN     "spotifyTokensId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SpotifyTokens" (
    "id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyTokens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_spotifyTokensId_fkey" FOREIGN KEY ("spotifyTokensId") REFERENCES "SpotifyTokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
