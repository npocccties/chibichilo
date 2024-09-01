import type { Book } from "@prisma/client";
import { AuthorSchema } from "./author";
import type { SectionProps, SectionSchema } from "./book/section";
import { sectionPropsSchema, sectionSchema } from "./book/section";
import type { PublicBookSchema } from "./book/public";
import { publicBookSchema } from "./book/public";
import type { LtiResourceLinkSchema } from "./ltiResourceLink";
import { ltiResourceLinkSchema } from "./ltiResourceLink";
import { KeywordPropSchema, KeywordSchema } from "./keyword";
import type { ReleaseSchema } from "./book/release";
import { releaseSchema } from "./book/release";

export type BookProps = {
  name: string;
  description?: string;
  language?: string;
  shared?: boolean;
  license?: string;
  sections?: SectionProps[];
  keywords?: KeywordPropSchema[];
  publicBooks?: PublicBookSchema[];
};

export type BookSchema = Book & {
  authors: AuthorSchema[];
  sections: SectionSchema[];
  ltiResourceLinks: LtiResourceLinkSchema[];
  keywords: KeywordSchema[];
  publicBooks?: PublicBookSchema[];
  release?: ReleaseSchema;
};

export const bookPropsSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    language: { type: "string", nullable: true },
    shared: { type: "boolean", nullable: true },
    license: { type: "string" },
    sections: {
      type: "array",
      items: sectionPropsSchema,
    },
    keywords: {
      type: "array",
      items: KeywordPropSchema,
    },
    publicBooks: {
      type: "array",
      items: publicBookSchema,
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
    license: { type: "string" },
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
    publicBooks: {
      type: "array",
      items: publicBookSchema,
    },
    release: {
      ...releaseSchema,
      nullable: true,
    },
  },
} as const;
