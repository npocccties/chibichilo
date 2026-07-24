import type { LtiConsumer, LtiContext } from "@prisma/client";
import type { ActivitySchema } from "$server/models/activity";
import type { UserSchema } from "$server/models/user";
import type { BookSchema } from "$server/models/book";
import prisma from "$server/utils/prisma";
import isCompleted from "./isCompleted";

async function fetchActivity(
  {
    learnerId,
    bookId,
    ltiConsumerId,
    ltiContextId,
  }: {
    learnerId: UserSchema["id"];
    bookId: BookSchema["id"];
    ltiConsumerId: LtiConsumer["id"];
    ltiContextId: LtiContext["id"];
  },
  currentLtiContextOnly: boolean
): Promise<Array<ActivitySchema>> {
  const activityScope = currentLtiContextOnly
    ? { ltiConsumerId, ltiContextId }
    : { ltiConsumerId: "", ltiContextId: "" };
  const activity = await prisma.activity.findMany({
    include: {
      learner: { select: { id: true, name: true, email: true } },
      topic: { select: { id: true, name: true, timeRequired: true } },
      timeRanges: { select: { activityId: true, startMs: true, endMs: true } },
    },
    where: {
      learnerId,
      topic: { topicSection: { some: { section: { bookId } } } },
      ...activityScope,
    },
  });

  return activity.map((a) => ({
    ...a,
    completed: isCompleted(a.topic, a),
    timeRanges: a.timeRanges,
  }));
}
export default fetchActivity;
