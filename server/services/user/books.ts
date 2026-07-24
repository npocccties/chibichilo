import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { UserParams } from "$server/validators/userParams";
import { userParamsSchema } from "$server/validators/userParams";
import type { PaginationProps } from "$server/validators/paginationProps";
import { paginationPropsSchema } from "$server/validators/paginationProps";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { findBooksBy } from "$server/utils/user";
import { userBooksSchema } from "$server/models/userBooks";

export type Query = PaginationProps;
export type Params = UserParams;

export const method = {
  get: {
    summary: "自分のブックの一覧 (非推奨)",
    deprecated: true,
    description: outdent`
      利用者が著者に含まれるブックの一覧を取得します。
      教員または管理者でなければなりません。`,
    querystring: paginationPropsSchema,
    params: userParamsSchema,
    response: {
      200: userBooksSchema,
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function index({
  query,
  params,
}: FastifyRequest<{ Querystring: Query; Params: Params }>) {
  const page = query.page ?? 0;
  const perPage = query.per_page ?? 50;
  const { user_id: userId } = params;
  const books = await findBooksBy(userId, query.sort, page, perPage);

  return {
    status: 200,
    body: { books, page, perPage },
  };
}
