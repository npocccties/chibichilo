import type { SessionSchema } from "$server/models/session";
import prisma from "$server/utils/prisma";

function findAllActivityWithTimeRangeCount(
  rewatchThreshold: number,
  session: SessionSchema,
  currentLtiContextOnly: boolean
) {
  const activityScope = currentLtiContextOnly
    ? {
        ltiConsumerId: session.oauthClient.id,
        ltiContextId: session.ltiContext.id,
      }
    : { ltiConsumerId: "", ltiContextId: "" };

  return prisma.activity.findMany({
    select: {
      id: true,
      totalTimeMs: true,
      topic: true,
      learner: true,
      _count: {
        select: {
          timeRangeCounts: {
            where: {
              count: {
                gte: rewatchThreshold,
              },
            },
          },
        },
      },
    },
    where: {
      ...activityScope,
    },
    orderBy: { id: "asc" },
  });
}

export default findAllActivityWithTimeRangeCount;
