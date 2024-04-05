/*
  Warnings:

  - Changed the type of `label` on the `Tag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "label",
ADD COLUMN     "label" TEXT NOT NULL;

-- DropEnum
DROP TYPE "TagLabel";

-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_key" ON "Tag"("label");
