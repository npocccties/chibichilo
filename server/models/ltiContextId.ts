import type { FromSchema } from "json-schema-to-ts";

export const LtiContextIdSchema = {
  description: "LTI Context ID derived from Bookmark",
  type: "string",
} as const;

/** LTIContext ID */
export type LtiContextIdSchema = FromSchema<typeof LtiContextIdSchema>;
