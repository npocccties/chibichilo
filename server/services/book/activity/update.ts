import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import { ActivitySchema } from "$server/models/activity";
import { ActivityQuery } from "$server/validators/activityQuery";
import authUser from "$server/auth/authUser";
import { show } from "./show";
import { publishScore } from "$server/utils/ltiv1p3/services";
import findClient from "$server/utils/ltiv1p3/findClient";
import findBook from "$server/utils/book/findBook";
import { getDisplayableBook } from "$server/utils/displayableBook";

type Params = BookParams;
type Query = ActivityQuery;

export const updateSchema = {
  summary: "学習状況の更新",
  description: outdent`
    現在のセッションの学習状況の詳細を更新します。
    自身以外の学習者の学習状況を更新することはできません。
    LTI v1.3 でなければなりません。`,
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
    401: {},
    404: {},
  },
};

export const updateHooks = {
  auth: [authUser],
};

export async function update(
  req: FastifyRequest<{
    Params: Params;
    Querystring: Query;
  }>
) {
  const res = await show(req);
  const activity = res.body?.activity;
  if (
    req.session.ltiVersion !== "1.3.0" ||
    req.session.ltiAgsEndpoint?.lineitem == null ||
    res.status !== 200 ||
    activity == null
  ) {
    return res;
  }

  const client = await findClient(req.session.oauthClient.id);
  if (client == null) return { status: 401 };

  const book = await findBook(req.params.book_id, req.session.user.id, req.ip);
  if (book == null) return { status: 404 };

  const topics =
    getDisplayableBook(
      book,
      undefined,
      req.session.ltiResourceLink ?? undefined
    )?.sections.flatMap((section) => section.topics.flat()) ?? [];
  const completedSet = new Set(
    activity.filter((a) => a.completed).map((a) => a.topic.id)
  );
  const completed = topics.filter((t) => completedSet.has(t.id));

  // https://www.imsglobal.org/sites/default/files/lti/ltiv2p1/model/mediatype/application/vnd/ims/lis/v1/score+json/index.html
  const score = {
    userId: req.session.user.ltiUserId,
    timestamp: new Date().toISOString(),
    scoreGiven: completed.length,
    scoreMaximum: topics.length,
    activityProgress: "Completed",
    gradingProgress: "FullyGraded",
  } as const;
  await publishScore(client, req.session.ltiAgsEndpoint.lineitem, score);

  return res;
}
