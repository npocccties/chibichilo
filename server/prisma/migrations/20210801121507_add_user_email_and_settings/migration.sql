-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "settings" JSONB NOT NULL DEFAULT E'{}';
