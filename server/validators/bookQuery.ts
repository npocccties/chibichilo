import type { FromSchema } from "json-schema-to-ts";

export const BookUpdateQuery = {
  type: "object",
  properties: {
    /** トピックを追加するとき、複製を行わないことを指示するオプションパラメータ */
    noclone: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

export type BookUpdateQuery = FromSchema<typeof BookUpdateQuery>;

export const BookDestroyQuery = {
  type: "object",
  properties: {
    /** ブックを削除するとき、トピックを同時に削除することを指示するオプションパラメータ */
    withtopic: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

export type BookDestroyQuery = FromSchema<typeof BookDestroyQuery>;
