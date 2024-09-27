import sortOrder from "$server/models/sortOrder";
import type { FromSchema } from "json-schema-to-ts";

export const SearchProps = {
  type: "object",
  required: ["type", "q"],
  properties: {
    type: {
      type: "string",
      enum: ["topic", "book"],
    },
    q: { type: "string" },
    filter: {
      type: "string",
      enum: ["all", "self", "other", "edit", "release", "other-release"],
    },
    sort: {
      type: "string",
      enum: sortOrder,
    },
    page: { type: "number" },
    per_page: { type: "number" },
  },
  additionalProperties: false,
} as const;

export type SearchProps = FromSchema<typeof SearchProps>;
