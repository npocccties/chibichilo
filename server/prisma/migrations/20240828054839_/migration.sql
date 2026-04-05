-- CreateTable
CREATE TABLE "release" (
    "book_id" INTEGER NOT NULL,
    "released_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL DEFAULT '0.0.0',
    "comment" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "release_pkey" PRIMARY KEY ("book_id")
);

-- AddForeignKey
ALTER TABLE "release" ADD CONSTRAINT "release_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
