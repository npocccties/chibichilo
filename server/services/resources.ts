import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import { resourceSchema } from "$server/models/resource";
import type { PaginationProps } from "$server/validators/paginationProps";
import { paginationPropsSchema } from "$server/validators/paginationProps";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import findResources from "$server/utils/resource/findResources";

export type Query = PaginationProps;

export const method = {
  get: {
    summary: "リソース一覧 (非推奨)",
    deprecated: true,
    description: outdent`
      リソースの一覧を取得します。
      教員または管理者でなければなりません。`,
    querystring: paginationPropsSchema,
    response: {
      200: {
        description: "成功時",
        type: "object",
        properties: {
          resources: {
            type: "array",
            items: resourceSchema,
          },
          page: paginationPropsSchema.properties?.page,
          perPage: paginationPropsSchema.properties?.per_page,
        },
      },
    },
  },
};

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function index({ query }: FastifyRequest<{ Querystring: Query }>) {
  const page = query.page ?? 0;
  const perPage = query.per_page ?? 50;
  const resources = await findResources(query.sort, page, perPage);

  return {
    status: 200,
    body: { resources, page, perPage },
  };
}
