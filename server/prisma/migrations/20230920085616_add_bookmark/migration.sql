-- CreateEnum
CREATE TYPE "TagLabel" AS ENUM ('INTERESTING', 'DIFFICULT', 'LATER', 'IMPORTANT');

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "label" "TagLabel" NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" SERIAL NOT NULL,
    "lti_consumer_id" TEXT NOT NULL,
    "lti_context_id" TEXT NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_key" ON "Tag"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_lti_consumer_id_lti_context_id_tag_id_user_id_topi_key" ON "Bookmark"("lti_consumer_id", "lti_context_id", "tag_id", "user_id", "topic_id");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_lti_consumer_id_lti_context_id_fkey" FOREIGN KEY ("lti_consumer_id", "lti_context_id") REFERENCES "lti_context"("consumer_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
