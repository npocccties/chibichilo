-- CreateTable
CREATE TABLE "activities_time_range_logs" (
    "id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_time_range_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "activities_time_range_logs" ADD CONSTRAINT "activities_time_range_logs_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
