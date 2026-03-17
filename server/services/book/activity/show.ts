import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import { ActivitySchema } from "$server/models/activity";
import { ActivityQuery } from "$server/validators/activityQuery";
import authUser from "$server/auth/authUser";
import fetchActivity from "$server/utils/activity/fetchActivity";

type Params = BookParams;
type Query = ActivityQuery;

export const showSchema = {
  summary: "学習状況の取得",
  description: outdent`
    現在のセッションの学習状況の詳細を取得します。
    自身以外の学習者の学習状況を取得することはできません。`,
  params: bookParamsSchema,
  querystring: ActivityQuery,
  response: {
    200: {
      type: "object",
      properties: {
        activity: { type: "array", items: ActivitySchema },
      },
      required: ["activity"],
    },
  },
};

export const showHooks = {
  auth: [authUser],
};

export async function show({
  session,
  params,
  query,
}: FastifyRequest<{
  Params: Params;
  Querystring: Query;
}>) {
  if (!session.user || !session.oauthClient || !session.ltiContext)
    return { status: 401 };

  const ltiConsumerId = query.lti_consumer_id ?? session.oauthClient.id;
  const ltiContextId = query.lti_context_id ?? session.ltiContext.id;

  const activity: Array<ActivitySchema> = await fetchActivity(
    {
      learnerId: session.user.id,
      bookId: params.book_id,
      ltiConsumerId,
      ltiContextId,
    },
    Boolean(query.current_lti_context_only)
  );

  return { status: 200, body: { activity } };
}
