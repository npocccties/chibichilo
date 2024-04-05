import type { JSONSchema } from "json-schema-to-ts";
import type { Bookmark } from "@prisma/client";
import { type TopicSchema } from "./topic";

export type BookmarkMemoContentProps = {
  memoContent: Bookmark["memoContent"];
  topicId: TopicSchema["id"];
};

export const bookmarkMemoContentPropsSchema = {
  type: "object",
  properties: {
    memoContent: { type: "string" },
    topicId: { type: "integer" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;
