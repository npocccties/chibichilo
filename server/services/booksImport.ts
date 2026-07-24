import type { FastifySchema } from "fastify";
import { outdent } from "outdent";
import {
  BooksImportParams,
  booksImportResultSchema,
} from "$server/models/booksImportParams";
import type { SessionSchema } from "$server/models/session";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import importBooksUtil from "$server/utils/book/importBooksUtil";

export type Params = BooksImportParams;

export const importSchema: FastifySchema = {
  summary: "ブックのインポート",
  description: outdent`
    ブックをインポートします。
    教員または管理者でなければなりません。`,
  //consumes: [ "multipart/form-data" ],
  body: BooksImportParams,
  response: {
    201: booksImportResultSchema,
    400: booksImportResultSchema,
  },
};

export const importHooks = {
  post: { auth: [authUser, authInstructor] },
};

export async function importBooks({
  session,
  body,
}: {
  session: SessionSchema;
  body: BooksImportParams;
}) {
  const result = await importBooksUtil(session.user, body);
  return {
    status: result.errors && result.errors.length ? 400 : 201,
    body: result,
  };
}
