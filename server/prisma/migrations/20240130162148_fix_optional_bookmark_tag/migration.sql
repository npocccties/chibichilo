-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_tag_id_fkey";

-- AlterTable
ALTER TABLE "Bookmark" ALTER COLUMN "tag_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
