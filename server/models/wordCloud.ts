import type { FromSchema } from "json-schema-to-ts";

export const WordCloudSchema = {
  title: "ワードクラウド",
  type: "array",
  items: {
    type: "object",
    properties: {
      text: { title: "Consumer ID", type: "string" },
      value: { title: "Context ID", type: "number" },
    },
    required: ["text", "value"],
    additionalProperties: false,
  },
} as const;

/** ワードクラウド */
export type WordCloudSchema = FromSchema<typeof WordCloudSchema>;
