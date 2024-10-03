import type { FromSchema } from "json-schema-to-ts";
import { UserSchema } from "./user";

/**
 * 表示名のマッピング
 * @todo 多言語対応したい
 */
const _roleNames = {
  author: "作成者",
  "co-author": "共同作成者",
  collaborator: "協力者",
  "original-author": "原著者",
  administrator: "管理者",
} as const;

/** 著者 */
export const AuthorSchema = {
  type: "object",
  required: [...UserSchema.required, "roleName"],
  properties: {
    ...UserSchema.properties,
    // TODO: 日本語表示名だが、いずれ多言語対応したい
    roleName: { title: "役割の名前", type: "string" },
  },
  additionalProperties: false,
  _roleNames,
} as const;

/** 著者 */
export type AuthorSchema = FromSchema<typeof AuthorSchema>;
