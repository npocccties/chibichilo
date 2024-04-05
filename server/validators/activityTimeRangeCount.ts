import type { FromSchema } from "json-schema-to-ts";

export const ActivityTimeRangeCountProps = {
  type: "object",
  required: ["startMs", "endMs"],
  properties: {
    startMs: { type: "integer" },
    endMs: { type: "integer" },
    count: { type: "number" },
  },
  additionalProperties: false,
} as const;

export type ActivityTimeRangeCountProps = FromSchema<
  typeof ActivityTimeRangeCountProps
>;
