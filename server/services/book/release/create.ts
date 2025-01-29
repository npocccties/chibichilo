import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import type { ReleaseProps } from "$server/models/book/release";
import { releasePropsSchema } from "$server/models/book/release";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isUsersOrAdmin } from "$server/utils/session";
import { createRelease } from "$server/utils/book/release";
import { bookSchema } from "$server/models/book";
import findBook from "$server/utils/book/findBook";
import { cloneRelease } from "$server/utils/book/cloneBook";

export const createSchema: FastifySchema = {
  summary: "ブックのリリースの作成",
  description: outdent`
    ブックのリリースを作成します。
    教員または管理者でなければなりません。
    教員は自身の著作のブックでなければなりません。`,
  params: bookParamsSchema,
  body: releasePropsSchema,
  response: {
    201: bookSchema,
    403: {},
    404: {},
  },
};

export const createHooks = {
  auth: [authUser, authInstructor],
};

export async function create({
  session,
  body,
  params,
}: FastifyRequest<{
  Body: ReleaseProps;
  Params: BookParams;
}>) {
  const found = await findBook(params.book_id, session.user.id);

  if (!found || found.release) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  const released = await cloneRelease(found, session.user.id);
  if (!released) return { status: 500 };

  const _ = await createRelease(released.id, body);
  const book = await findBook(released.id, session.user.id);

  return {
    status: 201,
    body: book,
  };
}
