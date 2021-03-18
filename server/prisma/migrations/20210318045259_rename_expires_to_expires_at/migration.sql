/*
  Warnings:

  - You are about to rename the `expires` column of the `sessions` table to `expires_at`.

*/
-- AlterTable
ALTER TABLE "sessions" RENAME COLUMN "expires" TO "expires_at" ;
