-- CreateTable
CREATE TABLE "activities_time_range_counts" (
    "activity_id" INTEGER NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "activities_time_range_counts_pkey" PRIMARY KEY ("activity_id","start_ms","end_ms")
);

-- AddForeignKey
ALTER TABLE "activities_time_range_counts" ADD CONSTRAINT "activities_time_range_counts_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
