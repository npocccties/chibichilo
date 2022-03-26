import type { Book } from "@prisma/client";
import { AuthorSchema } from "./author";
import type { SectionProps, SectionSchema } from "./book/section";
import { sectionPropsSchema, sectionSchema } from "./book/section";
import type { LtiResourceLinkSchema } from "./ltiResourceLink";
import { ltiResourceLinkSchema } from "./ltiResourceLink";
import { KeywordPropSchema, KeywordSchema } from "./keyword";

export type BookProps = {
  name: string;
  description?: string;
  language?: string;
  shared?: boolean;
  publishCondition?: string;
  sections?: SectionProps[];
  keywords?: KeywordPropSchema[];
};

export type BookSchema = Book & {
  publicUrl?: string;
  authors: AuthorSchema[];
  sections: SectionSchema[];
  ltiResourceLinks: LtiResourceLinkSchema[];
  keywords: KeywordSchema[];
};

export const bookPropsSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    language: { type: "string", nullable: true },
    shared: { type: "boolean", nullable: true },
    publishCondition: { type: "string" },
    sections: {
      type: "array",
      items: sectionPropsSchema,
    },
    keywords: {
      type: "array",
      items: KeywordPropSchema,
    },
  },
} as const;

export const bookSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    description: { type: "string" },
    language: { type: "string" },
    timeRequired: { type: "integer", nullable: true },
    shared: { type: "boolean" },
    publishCondition: { type: "string" },
    publicUrl: { type: "string" },
    publishedAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    details: { type: "object" },
    authors: { type: "array", items: AuthorSchema },
    keywords: { type: "array", items: KeywordSchema },
    sections: {
      type: "array",
      items: sectionSchema,
    },
    ltiResourceLinks: {
      type: "array",
      items: ltiResourceLinkSchema,
    },
  },
} as const;
