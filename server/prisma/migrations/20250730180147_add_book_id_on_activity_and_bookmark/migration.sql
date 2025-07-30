/*
  Warnings:

  - A unique constraint covering the columns `[book_id,topic_id,learner_id,lti_consumer_id,lti_context_id]` on the table `activities` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "activities_topic_id_learner_id_lti_consumer_id_lti_context__key";

-- AlterTable
ALTER TABLE "Bookmark" ADD COLUMN     "book_id" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "book_id" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "activities_book_id_topic_id_learner_id_lti_consumer_id_lti__key" ON "activities"("book_id", "topic_id", "learner_id", "lti_consumer_id", "lti_context_id");
