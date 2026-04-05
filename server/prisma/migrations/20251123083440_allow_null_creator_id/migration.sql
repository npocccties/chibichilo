-- DropForeignKey
ALTER TABLE "lti_resource_link" DROP CONSTRAINT "lti_resource_link_creator_id_fkey";

-- AlterTable
ALTER TABLE "lti_resource_link" ALTER COLUMN "creator_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "lti_resource_link" ADD CONSTRAINT "lti_resource_link_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
