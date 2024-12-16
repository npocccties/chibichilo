import type { FromSchema } from "json-schema-to-ts";

export const BookQuery = {
  type: "object",
  properties: {
    /** トピックを追加するとき、複製を行わないことを指示するオプションパラメータ */
    noclone: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

export type BookQuery = FromSchema<typeof BookQuery>;
