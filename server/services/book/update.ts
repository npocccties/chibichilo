import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookProps } from "$server/models/book";
import { bookPropsSchema, bookSchema } from "$server/models/book";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isUsersOrAdmin } from "$server/utils/session";
import bookExists from "$server/utils/book/bookExists";
import updateBook from "$server/utils/book/updateBook";
import { BookQuery } from "$server/validators/bookQuery";

export const updateSchema: FastifySchema = {
  summary: "ブックの更新",
  description: outdent`
    ブックを更新します。
    教員または管理者でなければなりません。
    教員は自身の著作のブックでなければなりません。
    追加トピックは複製されます。noclone=true を指定するとトピックを複製しません。`,
  params: bookParamsSchema,
  querystring: BookQuery,
  body: bookPropsSchema,
  response: {
    201: bookSchema,
    400: {},
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
  query,
}: FastifyRequest<{ Body: BookProps; Params: BookParams; Querystring: BookQuery; }>) {
  const found = await bookExists(params.book_id);
  console.log("@@@ BookUpdate: ", query);
  if (!found) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  const created = await updateBook(session.user.id, {
    ...body,
    id: params.book_id,
  });

  return {
    status: created == null ? 400 : 201,
    body: created,
  };
}
