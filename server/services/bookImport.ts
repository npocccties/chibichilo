import type { FastifySchema } from "fastify";
import { outdent } from "outdent";
import {
  BooksImportParams,
  booksImportResultSchema,
} from "$server/models/booksImportParams";
import type { SessionSchema } from "$server/models/session";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { importBookUtil } from "$server/utils/book/importBooksUtil";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import bookExists from "$server/utils/book/bookExists";
import { isUsersOrAdmin } from "$server/utils/session";

export type Params = BooksImportParams;

export const importSchema: FastifySchema = {
  summary: "ブックの上書きインポート",
  description: outdent`
    ブックを上書きインポートします。
    教員または管理者でなければなりません。
    教員は自身の著作のブックでなければなりません。`,
  params: bookParamsSchema,
  body: BooksImportParams,
  response: {
    201: booksImportResultSchema,
    400: booksImportResultSchema,
    403: {},
    404: {},
  },
};

export const importHooks = {
  post: { auth: [authUser, authInstructor] },
};

export async function importBook({
  session,
  params,
  body,
}: {
  session: SessionSchema;
  params: BookParams;
  body: BooksImportParams;
}) {
  const found = await bookExists(params.book_id);

  if (!found) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  const result = await importBookUtil(session, body, params.book_id);
  return {
    status: result.errors && result.errors.length ? 400 : 201,
    body: result,
  };
}
