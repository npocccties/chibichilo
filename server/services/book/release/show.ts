import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isUsersOrAdmin } from "$server/utils/session";
import findBook from "$server/utils/book/findBook";
import { ReleaseResultSchema } from "$server/models/releaseResult";
import { bookToReleaseItemSchema, findReleasedBooks } from "$server/utils/book/release";

export const showSchema: FastifySchema = {
  summary: "ブックのリリース一覧取得",
  description: outdent`
    ブックのリリース一覧を取得します。
    教員または管理者でなければなりません。
    教員は自身の著作のブックでなければなりません。`,
  params: bookParamsSchema,
  response: {
    200: ReleaseResultSchema,
    403: {},
    404: {},
  },
};

export const showHooks = {
  auth: [authUser, authInstructor],
};

export async function show({
  session,
  params,
}: FastifyRequest<{ Params: BookParams }>) {
  const book = await findBook(params.book_id, session.user.id);

  if (!book) return { status: 404 };
  if (!isUsersOrAdmin(session, book.authors) && !book.release?.shared) return { status: 403 };

  const books = await findReleasedBooks(book, session.user.id);
  const releases = books.map(bookToReleaseItemSchema);

  return {
    status: 200,
    body: { releases },
  };
}
