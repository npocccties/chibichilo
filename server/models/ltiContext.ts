import type { FromSchema } from "json-schema-to-ts";

export const LtiContextSchema = {
  title: "LTI Context",
  type: "object",
  required: ["id"],
  properties: {
    id: { title: "Context ID", type: "string" },
    consumerId: { title: "Consumer ID", type: "string" },
    label: { title: "コースコード", type: "string" },
    title: { title: "コースタイトルまたはコース名", type: "string" },
  },
  additionalProperties: false,
} as const;

/** LTI Context */
export type LtiContextSchema = FromSchema<typeof LtiContextSchema>;
