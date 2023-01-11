import type { FromSchema } from "json-schema-to-ts";
import { LtiContextSchema } from "./ltiContext";
import { MemberSchema } from "./member";

export const LtiNrpsContextMembershipSchema = {
  title:
    "LTI Names and Role Provisioning Service Parameterで取得できるLMSメンバー一覧",
  type: "object",
  required: ["id", "context", "members"],
  properties: {
    id: { title: "LMS memberships URL", type: "string" },
    context: LtiContextSchema,
    members: { type: "array", items: MemberSchema },
  },
  additionalProperties: false,
} as const;

/** LTI Names and Role Provisioning Service Parameterで取得できるLMSメンバー一覧 */
export type LtiNrpsContextMembershipSchema = FromSchema<
  typeof LtiNrpsContextMembershipSchema
>;
