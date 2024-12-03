/*
  Warnings:

  - A unique constraint covering the columns `[book_id,topic_id,learner_id,lti_consumer_id,lti_context_id]` on the table `activities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `book_id` to the `activities` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "activities_topic_id_learner_id_lti_consumer_id_lti_context__key";

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "book_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "activities_book_id_topic_id_learner_id_lti_consumer_id_lti__key" ON "activities"("book_id", "topic_id", "learner_id", "lti_consumer_id", "lti_context_id");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
