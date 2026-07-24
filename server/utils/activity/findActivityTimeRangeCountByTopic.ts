import type { Topic } from "@prisma/client";
import type { SessionSchema } from "$server/models/session";
import prisma from "$server/utils/prisma";

function findActivityTimeRangeCountByTopic(
  topicId: Topic["id"],
  session: SessionSchema,
  currentLtiContextOnly: boolean
) {
  const activityScope = currentLtiContextOnly
    ? {
        ltiConsumerId: session.oauthClient.id,
        ltiContextId: session.ltiContext.id,
      }
    : { ltiConsumerId: "", ltiContextId: "" };

  return prisma.activityTimeRangeCount.findMany({
    select: {
      activityId: true,
      startMs: true,
      endMs: true,
      count: true,
    },
    where: {
      activity: { ...activityScope, topicId: topicId },
    },
    orderBy: { activityId: "asc" },
  });
}

export default findActivityTimeRangeCountByTopic;
