import type { FromSchema } from "json-schema-to-ts";

export const MemberSchema = {
  title: "LTI Names and Role Provisioning Service Parameterで取得できるLMSメンバー",
  type: "object",
  required: ["id", "context", "members"],
  properties: {
    status: {type: "string"},
    roles: { type: "array", items: { sta: "string" } },
    user_id: {type: "string"},
    lis_person_sourcedid: {type: "string"},
  },
  additionalProperties: false,
} as const;

/** LTI Names and Role Provisioning Service Parameterで取得できるLMSメンバー */
export type MemberSchema = FromSchema<typeof MemberSchema>;
