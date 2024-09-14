import type { FromSchema } from "json-schema-to-ts";
import { AuthorSchema } from "./author";
import { releaseSchema } from "./book/release";

export const ReleaseItemSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    publishedAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    authors: { type: "array", items: AuthorSchema },
    release: {
      ...releaseSchema,
    },
  }
} as const;

export type ReleaseItemSchema = FromSchema<
  typeof ReleaseItemSchema, 
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

export const ReleaseResultSchema = {
  type: "object",
  properties: {
    releases: {
      type: "array",
      items: ReleaseItemSchema,
    },
  }
} as const;

export type ReleaseResultSchema = {
  releases: Array<ReleaseItemSchema>;
};
