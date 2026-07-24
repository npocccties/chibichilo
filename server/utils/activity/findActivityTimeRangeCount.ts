import type { Activity } from "@prisma/client";

import prisma from "$server/utils/prisma";

function findActivityTimeRangeCount(activityId: Activity["id"]) {
  return prisma.activityTimeRangeCount.findMany({
    select: {
      startMs: true,
      endMs: true,
      count: true,
    },
    where: {
      activityId: activityId,
    },
    orderBy: { startMs: "asc" },
  });
}

export default findActivityTimeRangeCount;
