import type { FastifySchema, FastifyRequest } from "fastify";
import type { TopicParams } from "$server/validators/topicParams";
import { topicParamsSchema } from "$server/validators/topicParams";
import { TopicActivityQuery } from "$server/validators/topicActivityQuery";
import { ActivityProps } from "$server/validators/activityProps";
import authUser from "$server/auth/authUser";
import authBookAccess from "$server/auth/authBookAccess";
import topicExists from "$server/utils/topic/topicExists";
import upsertTopicActivity from "$server/utils/activity/upsertTopicActivity";
import upsertLtiContextActivity from "$server/utils/activity/upsertLtiContextActivity";
import prisma from "$server/utils/prisma";

export type Params = TopicParams;
export type Query = TopicActivityQuery;
export type Props = ActivityProps;

export const updateSchema: FastifySchema = {
  summary: "学習活動の更新",
  description: "自身の学習活動を更新します。",
  params: topicParamsSchema,
  querystring: TopicActivityQuery,
  body: ActivityProps,
  response: {
    201: ActivityProps,
    400: {},
    403: {},
    404: {},
  },
};

export const updateHooks = {
  auth: [authUser, authBookAccess],
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

  const bookId = query.book_id;
  const isCurrentSessionBook = session.ltiResourceLink?.bookId === bookId;
  let ltiConsumerId = query.lti_consumer_id;
  let ltiContextId = query.lti_context_id;
  if (!ltiContextId && isCurrentSessionBook) {
    ltiConsumerId = session.oauthClient.id;
    ltiContextId = session.ltiContext.id;
  }
  let ltiContextActivity = null;
  if (ltiContextId && ltiConsumerId) {
    ltiContextActivity = await upsertLtiContextActivity({
      learnerId: session.user.id,
      bookId,
      topicId: params.topic_id,
      ltiConsumerId,
      ltiContextId,
      activity: body,
    });
  }

  if (ltiContextActivity == null) return { status: 400 };

  const topicActivity = await upsertTopicActivity({
    learnerId: session.user.id,
    bookId,
    topicId: params.topic_id,
    activity: body,
  });

  if (topicActivity == null) return { status: 400 };

  return {
    status: 201,
    body: query.current_lti_context_only ? ltiContextActivity : topicActivity,
  };
}
