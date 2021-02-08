/*
  Warnings:

  - Added the required column `label` to the `lti_context` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lti_context" ADD COLUMN "label" TEXT;

-- Set `title` to `label`
UPDATE "lti_context" SET label = title;

-- AlterTable
ALTER TABLE "lti_context" ALTER COLUMN "label" SET NOT NULL;
