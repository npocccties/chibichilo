import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isUsersOrAdmin } from "$server/utils/session";
import destroyBook from "$server/utils/book/destroyBook";
import { BookDestroyQuery } from "$server/validators/bookQuery";
import findBook from "$server/utils/book/findBook";
import destroyTopic from "$server/utils/topic/destroyTopic";

export const destroySchema: FastifySchema = {
  summary: "ブックの削除",
  description: outdent`
    ブックを削除します。
    教員または管理者でなければなりません。
    教員は自身の著作のブックでなければなりません。
    withtopic=trueを指定すると、ブックに含まれるトピックも同時に削除します。`,
  params: bookParamsSchema,
  querystring: BookDestroyQuery,
  response: {
    204: { type: "null", description: "成功" },
    403: {},
    404: {},
  },
};

export const destroyHooks = {
  auth: [authUser, authInstructor],
};

export async function destroy({
  session,
  params,
  query,
}: FastifyRequest<{ Params: BookParams; Querystring: BookDestroyQuery; }>) {
  const found = await findBook(params.book_id, session.user.id);

  if (!found) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  // トピックを削除
  if (query.withtopic) {
    for (const section of found.sections) {
      for (const topic of section.topics) {
        await destroyTopic(topic.id);
      }
    }
  }

  // ブックを削除
  await destroyBook(params.book_id);

  if (session.ltiResourceLink?.bookId === params.book_id) {
    session.ltiResourceLink = null;
  }

  return { status: 204 };
}
