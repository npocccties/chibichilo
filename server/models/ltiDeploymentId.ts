import type { FromSchema, JSONSchema } from "json-schema-to-ts";

export const LtiDeploymentIdSchema = {
  $id: "https://purl.imsglobal.org/spec/lti/claim/deployment_id",
  title: "LTI Deployment ID",
  type: "string",
} as const satisfies JSONSchema;

/** LTI Deployment ID */
export type LtiDeploymentIdSchema = FromSchema<typeof LtiDeploymentIdSchema>;
