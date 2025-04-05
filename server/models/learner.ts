import type { FromSchema } from "json-schema-to-ts";

/** 学習者 */
export const LearnerSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    /** 氏名 */
    name: { type: "string" },
    /** メールアドレス ("" は無効値) */
    email: { type: "string" },
    /** LMSクライアントID ("" は無効値) */
    ltiConsumerId: { type: "string" },
    /** LMSユーザID ("" は無効値) */
    ltiUserId: { type: "string" },
  },
  required: ["id", "name", "email"],
  additionalProperties: false,
} as const;

/** 学習者 */
export type LearnerSchema = FromSchema<typeof LearnerSchema>;
