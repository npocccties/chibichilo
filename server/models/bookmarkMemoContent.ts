import type { JSONSchema } from "json-schema-to-ts";
import type { Bookmark } from "$server/generated/prisma/client";
import { type TopicSchema } from "./topic";
import { type BookSchema } from "./book";

export type BookmarkMemoContentProps = {
  memoContent: Bookmark["memoContent"];
  topicId: TopicSchema["id"];
  bookId: BookSchema["id"];
  ltiConsumerId?: Bookmark["ltiConsumerId"];
  ltiContextId?: Bookmark["ltiContextId"];
};

export const bookmarkMemoContentPropsSchema = {
  type: "object",
  properties: {
    memoContent: { type: "string" },
    topicId: { type: "integer" },
    bookId: { type: "integer" },
    ltiConsumerId: { type: "string" },
    ltiContextId: { type: "string" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;
