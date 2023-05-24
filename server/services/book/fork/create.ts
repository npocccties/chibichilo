import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import bookExists from "$server/utils/book/bookExists";
import { bookSchema } from "$server/models/book";
import forkBook from "$server/utils/book/forkBook";

export const createSchema: FastifySchema = {
  summary: "ブックのフォーク",
  description: outdent`
    ブックをフォークします。
    教員または管理者でなければなりません。`,
  params: bookParamsSchema,
  response: {
    201: bookSchema,
    400: {},
    404: {},
  },
};

export const createHooks = {
  auth: [authUser, authInstructor],
};

export async function create({
  session,
  params,
}: FastifyRequest<{
  Params: BookParams;
}>) {
  const found = await bookExists(params.book_id);

  if (!found) return { status: 404 };

  const created = await forkBook(session.user.id, params.book_id);

  return {
    status: created == null ? 400 : 201,
    body: created,
  };
}