import type { FromSchema } from "json-schema-to-ts";
import { LtiContextSchema } from "$server/models/ltiContext";
import { LtiResourceLinkRequestSchema } from "$server/models/ltiResourceLinkRequest";
import { bookSchema } from "$server/models/book";

export const LinkSchema = {
  type: "object",
  required: [
    "oauthClientId",
    "createdAt",
    "ltiContext",
    "ltiResourceLink",
    "book",
  ],
  properties: {
    oauthClientId: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    ltiContext: LtiContextSchema,
    ltiResourceLink: LtiResourceLinkRequestSchema,
    book: {
      type: "object",
      required: ["id", "name", "shared", "authors"],
      properties: {
        id: bookSchema.properties.id,
        name: bookSchema.properties.name,
        shared: bookSchema.properties.shared,
        authors: bookSchema.properties.authors,
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const;

export type LinkSchema = FromSchema<
  typeof LinkSchema,
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
