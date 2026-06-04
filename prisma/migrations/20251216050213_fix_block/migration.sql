/*
  Warnings:

  - You are about to drop the column `upend` on the `Block` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Block" DROP COLUMN "upend",
ADD COLUMN     "uppend" BOOLEAN NOT NULL DEFAULT false;
