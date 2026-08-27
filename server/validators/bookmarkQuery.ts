import type { FromSchema } from "json-schema-to-ts";

/** ブックマーク取得のためのクエリー */
export const BookmarkQuery = {
  type: "object",
  properties: {
    topicId: { type: "number" },
    bookId: { type: "number" },
    tagIds: { type: "string" },
    isExistMemoContent: { type: "boolean" },
    isAllUsers: { type: "boolean" },
    ltiConsumerId: { type: "string" },
    ltiContextId: { type: "string" },
  },
  additionalProperties: false,
  oneOf: [{ required: ["topicId"] }, { required: ["tagIds"] }],
  required: ["isAllUsers"],
} as const;

/** ブックマーク取得のためのクエリー */
export type BookmarkQuery = FromSchema<typeof BookmarkQuery>;
