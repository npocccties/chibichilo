import type { FromSchema } from "json-schema-to-ts";

/** トピックごとの視聴回数取得のためのクエリー */
export const ActivityTimeRangeCountByTopicParams = {
  type: "object",
  properties: {
    topicId: { type: "number" },
  },
  additionalProperties: false,
  required: ["topicId"],
} as const;

/** トピックごとの視聴回数取得のためのクエリー */
export type ActivityTimeRangeCountByTopicParams = FromSchema<
  typeof ActivityTimeRangeCountByTopicParams
>;
