-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "emoji" TEXT;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "color";

-- DropIndex
DROP INDEX "Tag_label_key";

-- Update default `Tag`
INSERT INTO "Tag" ("id", "emoji", "label")
VALUES
  (1, E'\ud83d\udc40', E'\u5f8c\u3067\u898b\u308b'),
  (2, E'\ud83d\udcaa', E'\u96e3\u3057\u3044'),
  (3, E'\u2757',       E'\u91cd\u8981'),
  (4, E'\ud83d\udc96', E'\u304a\u6c17\u306b\u5165\u308a'),
  (5, E'\ud83d\udc4d', E'\u9ad8\u8a55\u4fa1')
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  label = EXCLUDED.label;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_key" ON "Tag"("label");

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "emoji" SET NOT NULL;
