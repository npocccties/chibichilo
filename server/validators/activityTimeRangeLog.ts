import type { FromSchema } from "json-schema-to-ts";

export const ActivityTimeRangeLogProps = {
  type: "object",
  required: ["startMs", "endMs"],
  properties: {
    id: { type: "number" },
    startMs: { type: "integer" },
    endMs: { type: "integer" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

export type ActivityTimeRangeLogProps = FromSchema<
  typeof ActivityTimeRangeLogProps,
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
