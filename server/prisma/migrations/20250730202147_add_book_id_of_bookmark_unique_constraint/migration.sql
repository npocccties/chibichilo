/*
  Warnings:

  - A unique constraint covering the columns `[lti_consumer_id,lti_context_id,tag_id,user_id,topic_id,book_id]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Bookmark_lti_consumer_id_lti_context_id_tag_id_user_id_topi_key";

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_lti_consumer_id_lti_context_id_tag_id_user_id_topi_key" ON "Bookmark"("lti_consumer_id", "lti_context_id", "tag_id", "user_id", "topic_id", "book_id");
