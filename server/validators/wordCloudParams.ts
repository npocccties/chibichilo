import type { FromSchema } from "json-schema-to-ts";

/** ワードクラウド取得のためのクエリー */
export const WordCloudParams = {
  type: "object",
  properties: {
    bookId: { type: "number" },
  },
  additionalProperties: false,
  required: ["bookId"],
} as const;

/** ワードクラウド取得のためのクエリー */
export type WordCloudParams = FromSchema<typeof WordCloudParams>;
