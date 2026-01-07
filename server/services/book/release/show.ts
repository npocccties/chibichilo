import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import { isAdministrator, isInstructor, isUsersOrAdmin } from "$server/utils/session";
import findBook from "$server/utils/book/findBook";
import { ReleaseResultSchema } from "$server/models/releaseResult";
import type { BookWithRelease } from "$server/utils/book/release";
import { bookToReleaseItemSchema, findReleasedBooks, findParentBook } from "$server/utils/book/release";

export const showSchema: FastifySchema = {
  summary: "ブックのリリース一覧取得",
  description: outdent`
    ブックのリリース一覧を取得します。
    管理者は、すべてのリリースの情報が取得できます。
    教員は自身の著作のブックと共有されたリリースに関する、すべてのリリースの情報が取得できます。
    教員または管理者いずれでもない場合、LTIリソースとしてリンクされているブックと親ブックの情報が取得できます。`,

  params: bookParamsSchema,
  response: {
    200: ReleaseResultSchema,
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
  const book = await findBook(params.book_id, session.user.id);

  if (!book) return { status: 404 };

  let books: Array<BookWithRelease> = [];

  if (isUsersOrAdmin(session, book.authors) || (isInstructor(session) && book.release?.shared)) {
    books = await findReleasedBooks(book, session.user.id, isAdministrator(session));
  } else if (session.ltiResourceLink?.bookId === params.book_id) {
    books = await findParentBook(book);
  } else {
    return { status: 403 };
  }
  
  const releases = books.map(bookToReleaseItemSchema);

  return {
    status: 200,
    body: { releases },
  };
}
