-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "anchorId" TEXT DEFAULT '',
ADD COLUMN     "styles" JSONB DEFAULT '{}';
