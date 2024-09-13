import type { FromSchema } from "json-schema-to-ts";
import type { Topic, Prisma } from "@prisma/client";
import type { ResourceProps, ResourceSchema } from "./resource";
import { resourcePropsSchema, resourceSchema } from "./resource";
import { AuthorSchema } from "./author";
import { KeywordPropSchema, KeywordSchema } from "./keyword";
import type { BookmarkSchema } from "./bookmark";
import { releaseSchema } from "./book/release";

const RelatedBook = {
  type: "object",
  required: ["id", "name"],
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    description: { type: "string" },
    language: { type: "string" },
    shared: { type: "boolean" },
    release: { ...releaseSchema, nullable: true },
  },
  additionalProperties: false,
} as const;

export type RelatedBook = FromSchema<
  typeof RelatedBook,
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

export type TopicProps = Pick<
  Prisma.TopicCreateInput,
  | "name"
  | "language"
  | "timeRequired"
  | "startTime"
  | "stopTime"
  | "shared"
  | "license"
  | "description"
> & {
  resource: ResourceProps;
  keywords?: KeywordPropSchema[];
};

export type TopicSchema = Topic & {
  authors: AuthorSchema[];
  keywords: KeywordSchema[];
  relatedBooks?: RelatedBook[];
  resource: ResourceSchema;
  bookmarks?: Omit<BookmarkSchema, "tag" | "topic" | "ltiContext">[];
};

export const TopicProps = {
  type: "object",
  properties: {
    name: { type: "string" },
    language: { type: "string" },
    timeRequired: { type: "integer" },
    startTime: { type: "number" },
    stopTime: { type: "number", nullable: true },
    shared: { type: "boolean" },
    license: { type: "string", format: "license" },
    description: { type: "string" },
    resource: resourcePropsSchema,
    keywords: {
      type: "array",
      items: KeywordPropSchema,
    },
  },
} as const;

export const topicSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    language: { type: "string" },
    timeRequired: { type: "integer" },
    startTime: { type: "number" },
    stopTime: { type: "number", nullable: true },
    shared: { type: "boolean" },
    license: { type: "string" },
    description: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    details: { type: "object" },
    authors: { type: "array", items: AuthorSchema },
    keywords: { type: "array", items: KeywordSchema },
    relatedBooks: { type: "array", items: RelatedBook },
    resource: resourceSchema,
  },
} as const;
