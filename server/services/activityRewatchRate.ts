import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isInstructor } from "$server/utils/session";
import { ActivityRewatchRateProps } from "$server/validators/activityRewatchRate";
import findAllActivityWithTimeRangeCount from "$server/utils/activity/findAllActivityWithTimeRangeCount";
import { ActivityQuery } from "$server/validators/activityQuery";
import { round } from "$server/utils/math";

export type Query = ActivityQuery;

export const method = {
  get: {
    summary: "受講者の繰返視聴割合の取得",
    description: outdent`
      受講者の繰返視聴割合を取得します。
      教員または管理者でなければなりません。`,
    querystring: ActivityQuery,
    response: {
      200: {
        type: "object",
        properties: {
          activityRewatchRate: {
            type: "array",
            items: ActivityRewatchRateProps,
          },
        },
        required: ["activityRewatchRate"],
      },
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

const ACTIVITY_COUNT_INTERVAL2 = Number(
  process.env.ACTIVITY_COUNT_INTERVAL ?? 1
);

const ACTIVITY_REWATCH_THRESHOLD2 = Number(
  process.env.ACTIVITY_REWATCH_THRESHOLD ?? 2
);

export async function index({
  session,
  query,
}: FastifyRequest<{ Querystring: Query }>) {
  if (!isInstructor(session)) {
    return { status: 403 };
  }

  const activities = await findAllActivityWithTimeRangeCount(
    session,
    Boolean(query.current_lti_context_only)
  );

  const activityRewatchRate = activities.map((activity) => {
    const rewatchRanges = activity.timeRangeCounts.filter((t) => {
      return t.count >= ACTIVITY_REWATCH_THRESHOLD2;
    });
    return {
      topicId: activity.topic.id,
      learnerId: activity.learner.id,
      rewatchRate: round(
        rewatchRanges.length /
          (activity.topic.timeRequired / ACTIVITY_COUNT_INTERVAL2),
        -3
      ),
    };
  });

  return {
    status: activityRewatchRate == null ? 404 : 200,
    body: {
      activityRewatchRate: activityRewatchRate,
    },
  };
}
