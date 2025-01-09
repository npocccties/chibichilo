import type { FromSchema } from "json-schema-to-ts";

/** メタ情報の更新のためのリクエストパラメータ */
export const metainfoProps = {
  type: "object",
  properties: {
    language: { type: "string" },
    license: { type: "string" },
    licenser: { type: "string" },
  },
  additionalProperties: false,
} as const;

export type MetainfoProps = FromSchema<typeof metainfoProps>;
