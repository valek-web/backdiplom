/*
  Warnings:

  - You are about to drop the column `registered` on the `AllowedEmail` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `AllowedEmail` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AllowedEmail" DROP COLUMN "registered",
ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "AllowedEmail_userId_key" ON "AllowedEmail"("userId");

-- AddForeignKey
ALTER TABLE "AllowedEmail" ADD CONSTRAINT "AllowedEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
