import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authInstructor from "$server/auth/authInstructor";
import authUser from "$server/auth/authUser";
import { SearchResultSchema } from "$server/models/search";
import { SearchProps } from "$server/validators/searchProps";
import search from "$server/utils/search/search";
import { isAdministrator } from "$server/utils/session";

export type Query = SearchProps;

export const method = {
  get: {
    summary: "コンテンツ検索",
    description: outdent`
      コンテンツを検索します。
      教員または管理者でなければなりません。`,
    querystring: SearchProps,
    response: {
      200: SearchResultSchema,
      400: {},
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function index({
  session,
  query,
}: FastifyRequest<{ Querystring: Query }>) {
  const filter = {
    type: query.filter ?? "all",
    by: session.user.id,
    admin: isAdministrator(session),
  };
  const sort = query.sort ?? "updated";
  const page = query.page ?? 0;
  const perPage = query.per_page ?? 50;

  switch (query.type) {
    case "topic":
    case "book": {
      const result = await search(
        query.type,
        query.q,
        filter,
        sort,
        page,
        perPage,
        session.user.id
      );

      return {
        status: 200,
        body: result,
      };
    }
    default:
      return { status: 400 };
  }
}
