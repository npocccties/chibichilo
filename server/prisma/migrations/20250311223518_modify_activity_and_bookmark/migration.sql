-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_book_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_book_id_fkey";

-- AlterTable
ALTER TABLE "Bookmark" ALTER COLUMN "book_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "book_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE CASCADE;
