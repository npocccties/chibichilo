import type { FromSchema } from "json-schema-to-ts";

export const LtiMemberBodySchema = {
  title: "LTI v1.3 LtiMemberの更新のParams",
  type: "object",
  required: ["user_ids"],
  properties: {
    user_ids: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
} as const;

export type LtiMemberBodySchema = FromSchema<typeof LtiMemberBodySchema>;
