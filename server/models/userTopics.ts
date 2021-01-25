import { topicSchema, TopicSchema } from "./topic";
import { paginationPropsSchema } from "$server/validators/paginationProps";

export type UserTopicsSchema = {
  topics: TopicSchema[];
  page?: number;
  perPage?: number;
};

export const userTopicsSchema = {
  description: "作成したトピックの一覧",
  type: "object",
  properties: {
    topics: {
      type: "array",
      items: topicSchema,
    },
    page: paginationPropsSchema.properties?.page,
    perPage: paginationPropsSchema.properties?.per_page,
  },
};
