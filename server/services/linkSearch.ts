import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authInstructor from "$server/auth/authInstructor";
import authUser from "$server/auth/authUser";
import { LinkSearchResultSchema } from "$server/models/link/search";
import { LinkSearchProps } from "$server/validators/linkSearchProps";
import search from "$server/utils/linkSearch/search";
import { isAdministrator } from "$server/utils/session";

export type Query = LinkSearchProps;

export const method = {
  get: {
    summary: "LTIリンク検索",
    description: outdent`
      LTIリンクを検索します。
      教員または管理者でなければなりません。`,
    querystring: LinkSearchProps,
    response: {
      200: LinkSearchResultSchema,
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
    type: "all" as const,
    by: session.user.id,
    admin: isAdministrator(session),
  };
  const sort = query.sort ?? "created";
  const page = query.page ?? 0;
  const perPage = query.per_page ?? 50;
  const result = await search(query.q, filter, sort, page, perPage, {
    oauthClientId: session.oauthClient.id,
    ltiContextId: session.ltiContext.id,
  });

  return {
    status: 200,
    body: result,
  };
}
