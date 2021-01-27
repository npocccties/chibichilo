import Method from "$server/types/method";
import { outdent } from "outdent";
import { bookSchema } from "$server/models/book";
import {
  PaginationProps,
  paginationPropsSchema,
} from "$server/validators/paginationProps";
import findBooks from "$server/utils/book/findBooks";
import { authInstructorHandler } from "$server/utils/authInstructorHandler";

export type IndexQuery = PaginationProps;

export const indexMethod: Method = {
  get: {
    summary: "ブック一覧",
    description: outdent`
      ブックの一覧を取得します。
      教員または管理者でなければなりません。`,
    querystring: paginationPropsSchema,
    response: {
      200: {
        description: "成功時",
        type: "object",
        properties: {
          books: {
            type: "array",
            items: bookSchema,
          },
          page: paginationPropsSchema.properties?.page,
          perPage: paginationPropsSchema.properties?.per_page,
        },
      },
    },
  },
};

async function index({ query }: { query: IndexQuery }) {
  const page = query.page ?? 0;
  const perPage = query.per_page ?? 100;
  const books = await findBooks(page, perPage);

  return {
    status: 200,
    body: { books, page, perPage },
  };
}

export const indexService = {
  method: indexMethod,
  get: index,
  preHandler: authInstructorHandler,
};
