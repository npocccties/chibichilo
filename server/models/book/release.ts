import type { FromSchema } from "json-schema-to-ts";

/** リリースの作成・更新のためのリクエストパラメータ */
export const releasePropsSchema = {
  type: "object",
  properties: {
    version: { type: "string" },
    comment: { type: "string" },
    shared: { type: "boolean" },
    topics: { type: "array", items: { type: "integer" } },
  },
  additionalProperties: false,
} as const;

export type ReleaseProps = FromSchema<typeof releasePropsSchema>;

const {topics: _topics, ...releaseSchemaProps} = releasePropsSchema.properties;

export const releaseSchema = {
  type: "object",
  properties: {
    releasedAt: { type: "string", format: "date-time" },
    ...releaseSchemaProps,
  },
  additionalProperties: false,
} as const;

export type ReleaseSchema = FromSchema<
  typeof releaseSchema,
  {
    deserialize: [
      {
        pattern: {
          type: "string";
          format: "date-time";
        };
        output: Date;
      },
    ];
  }
>;
