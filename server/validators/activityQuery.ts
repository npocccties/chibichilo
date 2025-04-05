import type { FromSchema } from "json-schema-to-ts";

/** 学習状況取得のためのクエリー */
export const ActivityQuery = {
  type: "object",
  properties: {
    /** 現在の LTI Context ごとでの学習状況を取得するか否か (true: LTI Context ごと, それ以外: すべて) */
    current_lti_context_only: { type: "boolean" },
    lti_consumer_id: { type: "string" },
    lti_context_id: { type: "string" },
  },
  additionalProperties: false,
} as const;

/** 学習状況取得のためのクエリー */
export type ActivityQuery = FromSchema<typeof ActivityQuery>;
