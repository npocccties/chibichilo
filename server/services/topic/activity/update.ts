import type { FastifySchema, FastifyRequest } from "fastify";
import type { TopicParams } from "$server/validators/topicParams";
import { topicParamsSchema } from "$server/validators/topicParams";
import { ActivityQuery } from "$server/validators/activityQuery";
import { ActivityProps } from "$server/validators/activityProps";
import authUser from "$server/auth/authUser";
import topicExists from "$server/utils/topic/topicExists";
import upsertTopicActivity from "$server/utils/activity/upsertTopicActivity";
import upsertLtiContextActivity from "$server/utils/activity/upsertLtiContextActivity";

export type Params = TopicParams;
export type Query = ActivityQuery;
export type Props = ActivityProps;

export const updateSchema: FastifySchema = {
  summary: "学習活動の更新",
  description: "自身の学習活動を更新します。",
  params: topicParamsSchema,
  querystring: ActivityQuery,
  body: ActivityProps,
  response: {
    201: ActivityProps,
    400: {},
    404: {},
  },
};

export const updateHooks = {
  auth: [authUser],
};

export async function update({
  session,
  params,
  query,
  body,
}: FastifyRequest<{
  Params: Params;
  Querystring: Query;
  Body: Props;
}>) {
  if (!session.user || !session.oauthClient || !session.ltiContext)
    return { status: 401 };

  const found = await topicExists(params.topic_id);

  if (!found) return { status: 404 };

  const ltiContextActivity = await upsertLtiContextActivity({
    learnerId: session.user.id,
    topicId: params.topic_id,
    ltiConsumerId: session.oauthClient.id,
    ltiContextId: session.ltiContext.id,
    activity: body,
  });

  if (ltiContextActivity == null) return { status: 400 };

  const topicActivity = await upsertTopicActivity({
    learnerId: session.user.id,
    topicId: params.topic_id,
    activity: body,
  });

  if (topicActivity == null) return { status: 400 };

  return {
    status: 201,
    body: query.current_lti_context_only ? ltiContextActivity : topicActivity,
  };
}
