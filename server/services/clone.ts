import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isUsersOrAdmin } from "$server/utils/session";
import { bookSchema } from "$server/models/book";
import findBook from "$server/utils/book/findBook";
import cloneBook from "$server/utils/book/cloneBook";
import { cloneBookUniqueIds, cloneTopicUniqueIds } from "$server/utils/uniqueId";

export const cloneSchema: FastifySchema = {
  summary: "ブックの複製",
  description: outdent`
    ブックを複製します。
    教員または管理者でなければなりません。`,
  params: bookParamsSchema,
  response: {
    201: bookSchema,
    403: {},
    404: {},
  },
};

export const cloneHooks = {
  post: { auth: [authUser, authInstructor] },
};

export async function clone({
  session,
  params,
}: FastifyRequest<{
  Params: BookParams;
}>) {
  const found = await findBook(params.book_id, session.user.id);

  if (!found) return { status: 404 };
  // TODO 見えるブックは複製できる
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  const created = await cloneBook(found, session.user.id, null, cloneBookUniqueIds, cloneTopicUniqueIds);
  if (!created) return { status: 500 };

  return {
    status: 201,
    body: created,
  };
}
