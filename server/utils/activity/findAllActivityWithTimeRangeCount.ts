import type { SessionSchema } from "$server/models/session";
import prisma from "$server/utils/prisma";

function findAllActivityWithTimeRangeCount(
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
      timeRangeCounts: true,
    },
    where: {
      ...activityScope,
    },
    orderBy: { id: "asc" },
  });
}

export default findAllActivityWithTimeRangeCount;
