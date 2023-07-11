import type { FromSchema, JSONSchema } from "json-schema-to-ts";

export const LtiTargetLinkUriSchema = {
  $id: "https://purl.imsglobal.org/spec/lti/claim/target_link_uri",
  title: "LTI Target Link URI",
  type: "string",
} as const satisfies JSONSchema;

/** LTI Target Link URI */
export type LtiTargetLinkUriSchema = FromSchema<typeof LtiTargetLinkUriSchema>;
