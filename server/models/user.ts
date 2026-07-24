import type { User } from "@prisma/client";
import type { FromSchema } from "json-schema-to-ts";
import { UserSettingsProps } from "$server/models/userSettings";

export type UserProps = Omit<User, "id" | "settings">;

/** 利用者 */
export const UserSchema = {
  type: "object",
  required: ["id", "ltiConsumerId", "ltiUserId", "name"],
  properties: {
    id: { type: "integer" },
    ltiConsumerId: { type: "string" },
    ltiUserId: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    settings: UserSettingsProps,
  },
  additionalProperties: false,
} as const;

/** 利用者 */
export type UserSchema = FromSchema<typeof UserSchema>;
