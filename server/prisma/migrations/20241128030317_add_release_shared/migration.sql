-- AlterTable
ALTER TABLE "books" ALTER COLUMN "shared" SET DEFAULT false;

-- AlterTable
ALTER TABLE "release" ADD COLUMN     "shared" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "topics" ALTER COLUMN "shared" SET DEFAULT false;
