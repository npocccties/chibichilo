import type { FromSchema } from "json-schema-to-ts";

/** ブックマーク取得のためのクエリー */
export const BookmarkQuery = {
  type: "object",
  properties: {
    topicId: { type: "number" },
    tagIds: { type: "string" },
    isExistMemoContent: { type: "boolean" },
    isAllUsers: { type: "boolean" },
  },
  additionalProperties: false,
  oneOf: [{ required: ["topicId"] }, { required: ["tagIds"] }],
  required: ["isAllUsers"],
} as const;

/** ブックマーク取得のためのクエリー */
export type BookmarkQuery = FromSchema<typeof BookmarkQuery>;
