import type { FromSchema } from "json-schema-to-ts";
import { LinkSchema } from "./content";

export const LinkSearchResultSchema = {
  type: "object",
  required: ["totalCount", "contents", "page", "perPage"],
  properties: {
    totalCount: { type: "integer" },
    contents: {
      type: "array",
      items: LinkSchema,
    },
    page: { type: "integer" },
    perPage: { type: "integer" },
  },
} as const;

export type LinkSearchResultSchema = FromSchema<
  typeof LinkSearchResultSchema,
  {
    deserialize: [
      {
        pattern: {
          type: "string";
          format: "date-time";
        };
        output: Date;
      }
    ];
  }
>;
