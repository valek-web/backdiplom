/*
  Warnings:

  - You are about to drop the `_BlockToVideo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToVideo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[videoId]` on the table `Block` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_BlockToVideo" DROP CONSTRAINT "_BlockToVideo_A_fkey";

-- DropForeignKey
ALTER TABLE "_BlockToVideo" DROP CONSTRAINT "_BlockToVideo_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToVideo" DROP CONSTRAINT "_ProductToVideo_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToVideo" DROP CONSTRAINT "_ProductToVideo_B_fkey";

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "videoId" INTEGER;

-- DropTable
DROP TABLE "_BlockToVideo";

-- DropTable
DROP TABLE "_ProductToVideo";

-- CreateIndex
CREATE UNIQUE INDEX "Block_videoId_key" ON "Block"("videoId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
