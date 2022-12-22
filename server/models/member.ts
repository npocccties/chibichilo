import type { FromSchema } from "json-schema-to-ts";

export const MemberSchema = {
  title:
    "LTI Names and Role Provisioning Service Parameterで取得できるLMSメンバー",
  type: "object",
  required: ["status", "roles", "user_id", "lis_person_sourcedid"],
  properties: {
    status: { type: "string" },
    roles: { type: "array", items: { type: "string" } },
    user_id: { type: "string" },
    lis_person_sourcedid: { type: "string" },
  },
  additionalProperties: false,
} as const;

/** LTI Names and Role Provisioning Service Parameterで取得できるLMSメンバー */
export type MemberSchema = FromSchema<typeof MemberSchema>;
