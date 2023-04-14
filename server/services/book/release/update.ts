import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import type { ReleaseProps } from "$server/models/book/release";
import { releasePropsSchema, releaseSchema } from "$server/models/book/release";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import bookExists from "$server/utils/book/bookExists";
import { isUsersOrAdmin } from "$server/utils/session";
import { upsertRelease } from "$server/utils/book/upsertRelease";

export const updateSchema: FastifySchema = {
  summary: "ブックのリリースの作成・更新",
  description: outdent`
    ブックのリリースを作成・更新します。
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
  const found = await bookExists(params.book_id);

  if (!found) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  const created = await upsertRelease(params.book_id, body);

  return {
    status: 201,
    body: created,
  };
}
