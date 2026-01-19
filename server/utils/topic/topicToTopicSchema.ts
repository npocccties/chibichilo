import type { Book, Prisma } from "@prisma/client";
import type { TopicSchema } from "$server/models/topic";
import {
  authorArg,
  authorToAuthorSchema,
} from "$server/utils/author/authorToAuthorSchema";
import {
  resourceWithVideoArg,
  resourceToResourceSchema,
} from "$server/utils/resource/toSchema";

export const topicsWithResourcesArg = {
  include: {
    authors: authorArg,
    resource: resourceWithVideoArg,
    keywords: true,
    topicSection: { include: { section: { include: { book: { include: { release: true } } } } } },
    bookmarks: true,
  },
} as const;

export type TopicWithResource = Prisma.TopicGetPayload<
  typeof topicsWithResourcesArg
>;

/**
 * TopicSchemaへの変換
 * @param topicWithResource データベースで扱われるリソース含むTopic
 * @param options オプション
 * @param options.relatedBooksMap トピックに関連するブックの集合
 */
export function topicToTopicSchema(
  { topicSection, ...topic }: TopicWithResource,
  options?: {
    relatedBooksMap: Map<Book["id"], Book>;
  }
): TopicSchema {
  return {
    ...topic,
    authors: topic.authors.map(authorToAuthorSchema),
    resource: resourceToResourceSchema(topic.resource),
    relatedBooks: options && [
      ...topicSection
        .reduce(
          (books, ts) => {
            const book = ts.section.book;
            if (books.has(book.id)) return books;
            if (options.relatedBooksMap.has(book.id)) {
              books.set(book.id, book);
            }
            return books;
          },
          new Map() as Map<Book["id"], Book>
        )
        .values(),
    ],
  };
}
