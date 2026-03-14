-- CreateTable
CREATE TABLE "lti_members_admin" (
    "consumer_id" TEXT NOT NULL,
    "context_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "lti_members_admin_pkey" PRIMARY KEY ("consumer_id","context_id","user_id")
);

-- AddForeignKey
ALTER TABLE "lti_members_admin" ADD CONSTRAINT "lti_members_admin_consumer_id_user_id_fkey" FOREIGN KEY ("consumer_id", "user_id") REFERENCES "users"("lti_consumer_id", "lti_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
