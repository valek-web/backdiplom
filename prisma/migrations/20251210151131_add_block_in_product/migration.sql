/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `Block` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `Block` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "productId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Block_productId_key" ON "Block"("productId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
