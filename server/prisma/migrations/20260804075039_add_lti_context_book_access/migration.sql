-- AlterTable
ALTER TABLE "_BookToKeyword" ADD CONSTRAINT "_BookToKeyword_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BookToKeyword_AB_unique";

-- AlterTable
ALTER TABLE "_KeywordToTopic" ADD CONSTRAINT "_KeywordToTopic_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_KeywordToTopic_AB_unique";

-- CreateTable
CREATE TABLE "lti_context_book_access" (
    "book_id" INTEGER NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "context_id" TEXT NOT NULL,
    "allow_viewing" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "lti_context_book_access_pkey" PRIMARY KEY ("book_id","consumer_id","context_id")
);

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lti_context_book_access" ADD CONSTRAINT "lti_context_book_access_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lti_context_book_access" ADD CONSTRAINT "lti_context_book_access_consumer_id_context_id_fkey" FOREIGN KEY ("consumer_id", "context_id") REFERENCES "lti_context"("consumer_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
