-- AlterTable
ALTER TABLE "books" ADD COLUMN     "oid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "poid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "vid" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "oid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "poid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "vid" TEXT NOT NULL DEFAULT '';
