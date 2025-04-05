import type { FromSchema } from "json-schema-to-ts";

/** 視聴回数取得のためのクエリー */
export const ActivityTimeRangeCountParams = {
  type: "object",
  properties: {
    activityId: { type: "number" },
  },
  additionalProperties: false,
  required: ["activityId"],
} as const;

/** 視聴回数取得のためのクエリー */
export type ActivityTimeRangeCountParams = FromSchema<
  typeof ActivityTimeRangeCountParams
>;
