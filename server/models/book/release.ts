import type { FromSchema } from "json-schema-to-ts";

/** リリースの作成・更新のためのリクエストパラメータ */
export const releasePropsSchema = {
  type: "object",
  properties: {
    version: { type: "string" },
    comment: { type: "string" },
  },
  additionalProperties: false,
} as const;

export type ReleaseProps = FromSchema<typeof releasePropsSchema>;

export const releaseSchema = {
  type: "object",
  properties: {
    bookId: { type: "integer" },
    releasedAt: { type: "string", format: "date-time" },
    ...releasePropsSchema.properties,
  },
  additionalProperties: false,
} as const;
