

import type { FromSchema } from "json-schema-to-ts";

export const LtiMemberParamsSchema = {
  title: "LTI v1.3 LtiMemberの更新のParams",
  type: "object",
  required: ["userIds"],
  properties: {
    userIds: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
} as const;

export type LtiMemberParamsSchema = FromSchema<typeof LtiMemberParamsSchema>;
