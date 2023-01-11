import type { FromSchema } from "json-schema-to-ts";
import { LtiContextSchema } from "./ltiContext";
import { UserSchema } from "./user";

export const LtiMembersSchema = {
  title: "LTI Members",
  type: "array",
  items: {
    required: ["userId", "contextId", "consumerId"],
    properties: {
      consumerId: { title: "Consumer ID", type: "string" },
      contextId: { title: "Context ID", type: "string" },
      userId: { title: "User ID", type: "string" },
      user: UserSchema,
      context: LtiContextSchema,
    },
    additionalProperties: false,
  },
} as const;

/** LTI Members */
export type LtiMembersSchema = FromSchema<typeof LtiMembersSchema>;
