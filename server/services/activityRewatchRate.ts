import type { FastifyRequest } from "fastify";
import outdent from "$utils/outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isInstructor } from "$server/utils/session";
import { ActivityRewatchRateProps } from "$server/validators/activityRewatchRate";
import findAllActivityWithTimeRangeCount from "$server/utils/activity/findAllActivityWithTimeRangeCount";
import { ActivityQuery } from "$server/validators/activityQuery";
import { round } from "$server/utils/math";
import type { SessionSchema } from "$server/models/session";

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

function parseEnvInt(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value.trim() === "") return defaultValue;
  const n = Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

const ACTIVITY_COUNT_INTERVAL2 = parseEnvInt(
  process.env.ACTIVITY_COUNT_INTERVAL,
  1
);

const ACTIVITY_REWATCH_THRESHOLD2 = parseEnvInt(
  process.env.ACTIVITY_REWATCH_THRESHOLD,
  2
);

function calcRewatchRate(
  timeRangeCounts: number,
  timeRequired: number,
  countInterval: number
): number {
  if (countInterval <= 0) return 0;
  const divisor = timeRequired / countInterval;
  if (divisor <= 0 || !Number.isFinite(divisor)) return 0;
  const rate = timeRangeCounts / divisor;
  if (!Number.isFinite(rate)) return 0;
  return round(rate, -3);
}

export async function getActivityRewatchRate(
  session: SessionSchema,
  query: Query,
  administrator?: boolean
) {
  const activities = await findAllActivityWithTimeRangeCount(
    ACTIVITY_REWATCH_THRESHOLD2,
    session,
    Boolean(query.current_lti_context_only),
    administrator
  );

  const activityRewatchRate = activities.map((activity) => {
    return {
      bookId: activity.bookId,
      topicId: activity.topic.id,
      learnerId: activity.learnerId,
      rewatchRate: calcRewatchRate(
        activity._count.timeRangeCounts,
        activity.topic.timeRequired,
        ACTIVITY_COUNT_INTERVAL2
      ),
    };
  });
  return activityRewatchRate;
}

export async function index({
  session,
  query,
}: FastifyRequest<{ Querystring: Query }>) {
  if (!isInstructor(session)) {
    return { status: 403 };
  }

  const activityRewatchRate = await getActivityRewatchRate(session, query);

  return {
    status: activityRewatchRate == null ? 404 : 200,
    body: {
      activityRewatchRate: activityRewatchRate,
    },
  };
}
