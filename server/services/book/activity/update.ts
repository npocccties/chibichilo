import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import { ActivitySchema } from "$server/models/activity";
import { ActivityQuery } from "$server/validators/activityQuery";
import authUser from "$server/auth/authUser";
import authBookAccess from "$server/auth/authBookAccess";
import { show } from "./show";
import { publishScore } from "$server/utils/ltiv1p3/grade";
import findClient from "$server/utils/ltiv1p3/findClient";
import findBook from "$server/utils/book/findBook";
import { getDisplayableBook } from "$server/utils/displayableBook";
import { getGradeTargets } from "$server/utils/ltiv1p3/getGradeTargets";

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
    400: {},
    401: {},
    403: {},
    404: {},
  },
};

export const updateHooks = {
  auth: [authUser, authBookAccess],
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
    res.status !== 200 ||
    activity == null
  ) {
    return res;
  }
  const book = await findBook(req.params.book_id, req.session.user.id);
  if (book == null) return { status: 404 };

  const currentResourceLink =
    req.session.ltiResourceLink?.bookId === book.id
      ? req.session.ltiResourceLink
      : {
          bookId: book.id,
          creatorId: book.authors[0]?.id ?? 0,
          instructors: [],
        };
  const topics =
    getDisplayableBook(
      book,
      undefined,
      currentResourceLink ?? undefined
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
  const targets = await getGradeTargets(
    book.id,
    req.session.user.id,
    req.session,
    req.query
  );
  if (targets.length > 0) {
    await Promise.allSettled(
      targets.map(async (target) => {
        try {
          const client = await findClient(target.consumerId);
          if (!client) {
            throw new Error(
              `Client not found for consumer: ${target.consumerId}`
            );
          }
          await publishScore(client, target.lineItem, score);
        } catch (e) {
          req.log.error(e, `[Failed] Context: ${target.contextId}`);
        }
      })
    );
  }
  return res;
}
