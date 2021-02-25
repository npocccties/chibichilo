import { FastifySchema } from "fastify";
import { outdent } from "outdent";
import { BookParams, bookParamsSchema } from "$server/validators/bookParams";
import { SessionSchema } from "$server/models/session";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isUserOrAdmin } from "$server/utils/session";
import bookExists from "$server/utils/book/bookExists";
import destroyBook from "$server/utils/book/destroyBook";

export const destroySchema: FastifySchema = {
  summary: "ブックの削除",
  description: outdent`
    ブックを削除します。
    教員または管理者でなければなりません。
    教員の場合は自身の作成したブックでなければなりません。`,
  params: bookParamsSchema,
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
}: {
  session: SessionSchema;
  params: BookParams;
}) {
  const found = await bookExists(params.book_id);

  if (!found) return { status: 404 };
  if (!isUserOrAdmin(session, { id: found.authorId })) return { status: 403 };

  await destroyBook(params.book_id);

  if (session.ltiResourceLink?.bookId === params.book_id) {
    session.ltiResourceLink = null;
  }

  return { status: 204 };
}
