import type { FromSchema } from "json-schema-to-ts";

export const LtiNrpsParameterSchema = {
  title: "LTI Names and Role Provisioning Service Parameter",
  type: "object",
  required: ["context_memberships_url", "service_versions"],
  properties: {
    context_memberships_url: { type: "string" },
    service_versions: { type: "array", items: { type: "string" } },
  },
  additionalProperties: false,
} as const;

/** LTI Names and Role Provisioning Service Parameter */
export type LtiNrpsParameterSchema = FromSchema<typeof LtiNrpsParameterSchema>;
