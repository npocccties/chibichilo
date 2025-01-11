import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isUsersOrAdmin } from "$server/utils/session";
import findBook from "$server/utils/book/findBook";
import type { MetainfoProps } from "$server/models/metainfo";
import { metainfoProps } from "$server/models/metainfo";
import { updateBookMetainfo } from "$server/utils/metainfo";

export const updateSchema: FastifySchema = {
  summary: "ブックのメタ情報の更新",
  description: outdent`
    ブックのメタ情報を更新します。
    教員または管理者でなければなりません。
    教員は自身の著作のブックでなければなりません。`,
  params: bookParamsSchema,
  body: metainfoProps,
  response: {
    201: metainfoProps,
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
  Body: MetainfoProps;
  Params: BookParams;
}>) {
  const found = await findBook(params.book_id, session.user.id);

  if (!found) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  const updated = await updateBookMetainfo(params.book_id, body);

  return {
    status: 201,
    body: updated,
  };
}
