/*
  Warnings:

  - The values [READ_SALES,WRITE_SALES] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('ACCESS_TASKS', 'READ_POST', 'WRITE_POST', 'ACCESS_ADMIN', 'ACCESS_CHAT', 'ACCESS_SALES');
ALTER TABLE "public"."User" ALTER COLUMN "permissions" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "permissions" TYPE "Permission_new"[] USING ("permissions"::text::"Permission_new"[]);
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "public"."Permission_old";
ALTER TABLE "User" ALTER COLUMN "permissions" SET DEFAULT ARRAY[]::"Permission"[];
COMMIT;
