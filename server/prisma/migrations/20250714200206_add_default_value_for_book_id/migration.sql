/*
  Warnings:

  - Made the column `book_id` on table `Bookmark` required. This step will fail if there are existing NULL values in that column.
  - Made the column `book_id` on table `activities` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Bookmark" ALTER COLUMN "book_id" SET NOT NULL,
ALTER COLUMN "book_id" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "book_id" SET NOT NULL,
ALTER COLUMN "book_id" SET DEFAULT 0;
