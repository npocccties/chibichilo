import type { FromSchema, JSONSchema } from "json-schema-to-ts";

/** ブックマークの統計情報 */
export const BookmarkStats = {
  type: "array",
  items: {
    type: "object",
    properties: {
      topicId: { type: "integer" },
      tagLabel: { type: "string" },
      totalCount: { type: "integer" },
    },
    required: ["topicId", "tagLabel", "totalCount"],
  },
} as const satisfies JSONSchema;

export type BookmarkStats = FromSchema<typeof BookmarkStats>;
