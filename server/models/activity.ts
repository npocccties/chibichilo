import type { FromSchema } from "json-schema-to-ts";
import { ActivityTimeRangeSchema } from "./activityTimeRange";
import { LearnerSchema } from "./learner";
import { LtiContextSchema } from "./ltiContext";

/** 学習活動 */
export const ActivitySchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    learner: LearnerSchema,
    ltiContext: LtiContextSchema,
    topic: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        timeRequired: { type: "integer" },
      },
      required: ["id", "name", "timeRequired"],
      additionalProperties: false,
    },
    /** 学習状況 - 完了: true, それ以外: false */
    completed: { type: "boolean" },
    /** 合計学習時間 (ms) */
    totalTimeMs: { type: "integer" },
    /** 学習活動のビデオ視聴範囲  */
    timeRanges: {
      type: "array",
      items: ActivityTimeRangeSchema,
    },
    /** 作成日時 */
    createdAt: { type: "string", format: "date-time" },
    /** 更新日時 */
    updatedAt: { type: "string", format: "date-time" },
  },
  required: [
    "id",
    "learner",
    "topic",
    "completed",
    "totalTimeMs",
    "timeRanges",
    "createdAt",
    "updatedAt",
  ],
  additionalProperties: false,
} as const;

/** 学習活動 */
export type ActivitySchema = FromSchema<
  typeof ActivitySchema,
  {
    deserialize: [
      {
        pattern: {
          type: "string";
          format: "date-time";
        };
        output: Date;
      },
    ];
  }
>;
