/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Activity_userId_key" ON "Activity"("userId");
