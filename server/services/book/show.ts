import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import { bookSchema } from "$server/models/book";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import findBook from "$server/utils/book/findBook";
import { isInstructor } from "$utils/session";
import checkLtiResourceLink from "$server/utils/book/checkLtiResourceLink";

export const showSchema: FastifySchema = {
  summary: "ブックの取得",
  description: outdent`
    ブックの詳細を取得します。
    教員または管理者いずれでもない場合、LTIリソースとしてリンクされているブックでなければなりません。`,
  params: bookParamsSchema,
  response: {
    200: bookSchema,
    403: {},
    404: {},
  },
};

export const showHooks = {
  auth: [authUser],
};

export async function show({
  session,
  params,
}: FastifyRequest<{ Params: BookParams }>) {
  const { book_id: bookId } = params;

  if (
    !isInstructor(session) &&
    !(await checkLtiResourceLink(bookId, session, {}))
  ) {
    return { status: 403 };
  }

  const book = await findBook(bookId, session.user.id);

  return {
    status: book == null ? 404 : 200,
    body: book,
  };
}
