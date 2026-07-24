import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isInstructor } from "$server/utils/session";
import { ActivityTimeRangeCountProps } from "$server/validators/activityTimeRangeCount";
import { ActivityTimeRangeCountByTopicParams } from "$server/validators/activityTimeRangeCountByTopicParams";
import findActivityTimeRangeCountByTopic from "$server/utils/activity/findActivityTimeRangeCountByTopic";
import { ActivityQuery } from "$server/validators/activityQuery";

export type Query = ActivityQuery;
export type Params = ActivityTimeRangeCountByTopicParams;

export const method = {
  get: {
    summary: "トピックごとの受講者の視聴行動回数の取得",
    description: outdent`
      トピックごとの受講者の視聴行動回数を取得します。
      教員または管理者でなければなりません。`,
    params: ActivityTimeRangeCountByTopicParams,
    querystring: ActivityQuery,
    response: {
      200: {
        type: "array",
        items: ActivityTimeRangeCountProps,
      },
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function show({
  session,
  params,
  query,
}: FastifyRequest<{ Params: Params; Querystring: Query }>) {
  const { topicId } = params;

  if (!isInstructor(session)) {
    return { status: 403 };
  }

  const activityTimeRangeCounts = await findActivityTimeRangeCountByTopic(
    topicId,
    session,
    query.current_lti_context_only ?? false
  );

  return {
    status: activityTimeRangeCounts == null ? 404 : 200,
    body: activityTimeRangeCounts,
  };
}
