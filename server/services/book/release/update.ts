import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import type { ReleaseProps } from "$server/models/book/release";
import { releasePropsSchema, releaseSchema } from "$server/models/book/release";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isUsersOrAdmin } from "$server/utils/session";
import { updateRelease } from "$server/utils/book/release";
import findBook from "$server/utils/book/findBook";

export const updateSchema: FastifySchema = {
  summary: "ブックのリリースの更新",
  description: outdent`
    ブックのリリースを更新します。
    教員または管理者でなければなりません。
    教員は自身の著作のブックでなければなりません。`,
  params: bookParamsSchema,
  body: releasePropsSchema,
  response: {
    201: releaseSchema,
    403: {},
    404: {},
  },
};

export const updateHooks = {
  auth: [authUser, authInstructor],
};

export async function update({
  session,
  body,
  params,
}: FastifyRequest<{
  Body: ReleaseProps;
  Params: BookParams;
}>) {
  const found = await findBook(params.book_id, session.user.id);

  if (!found || !found.release) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  const { topics: _topics, ...release } = body;
  const updated = await updateRelease(params.book_id, release);

  return {
    status: 201,
    body: updated,
  };
}
