import type { FromSchema } from "json-schema-to-ts";

/** Bookmark削除のためのリクエストパラメーター */
export const BookmarkParams = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "number" },
  },
  additionalProperties: false,
} as const;

/** Bookmark削除のためのリクエストパラメーター */
export type BookmarkParams = FromSchema<typeof BookmarkParams>;
