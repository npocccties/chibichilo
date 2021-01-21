import Method from "$server/types/method";
import { outdent } from "outdent";
import { topicSchema } from "$server/models/topic";
import {
  PaginationProps,
  paginationPropsSchema,
} from "$server/validators/paginationProps";
import findTopics from "$server/utils/topic/findTopics";
import { authInstructorHandler } from "$server/utils/authInstructorHandler";

export type IndexQuery = PaginationProps;

const indexMethod: Method = {
  get: {
    summary: "トピック一覧",
    description: outdent`
      トピックの一覧を取得します。
      教員または管理者でなければなりません。`,
    querystring: paginationPropsSchema,
    response: {
      200: {
        description: "成功時",
        type: "object",
        properties: {
          topics: {
            type: "array",
            items: topicSchema,
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
  const topics = await findTopics(page, perPage);

  return {
    status: 200,
    body: { topics, page, perPage },
  };
}

export const indexService = {
  method: indexMethod,
  get: index,
  preHandler: authInstructorHandler,
};
