import type { FromSchema } from "json-schema-to-ts";

export const LtiConsumerIdSchema = {
  description: "LTI Consumer ID derived from Bookmark",
  type: "string",
} as const;

/** LTIConsumer ID */
export type LtiConsumerIdSchema = FromSchema<typeof LtiConsumerIdSchema>;
