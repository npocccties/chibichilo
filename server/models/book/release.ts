import type { FromSchema } from "json-schema-to-ts";

/** リリースの作成・更新のためのリクエストパラメータ */
export const ReleaseProps = {
  type: "object",
  properties: {
    version: { type: "string" },
    comment: { type: "string" },
  },
  additionalProperties: false,
} as const;

export type ReleaseProps = FromSchema<typeof ReleaseProps>;
