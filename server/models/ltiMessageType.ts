import type { FromSchema, JSONSchema } from "json-schema-to-ts";

export const LtiMessageTypeSchema = {
  $id: "https://purl.imsglobal.org/spec/lti/claim/message_type",
  title: "LTI Message Type",
  type: "string",
  enum: ["LtiResourceLinkRequest", "LtiDeepLinkingRequest"],
} as const satisfies JSONSchema;

/** LTI Message Type */
export type LtiMessageTypeSchema = FromSchema<typeof LtiMessageTypeSchema>;
