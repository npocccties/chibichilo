import type { FromSchema } from "json-schema-to-ts";

export const ActivityRewatchRateProps = {
  type: "object",
  required: ["topicId", "learnerId", "rewatchRate"],
  properties: {
    topicId: { type: "integer" },
    learnerId: { type: "integer" },
    rewatchRate: { type: "number" },
  },
  additionalProperties: false,
} as const;

export type ActivityRewatchRateProps = FromSchema<
  typeof ActivityRewatchRateProps
>;
