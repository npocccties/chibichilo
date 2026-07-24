import { mutate } from "swr";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";

const CLEAR_OPTIONS = { revalidate: false } as const;

const BOOK_KEY = "/api/v2/book/{book_id}";
const BOOK_RELEASE_KEY = "/api/v2/book/{book_id}/release";
const BOOK_AUTHORS_KEY = "/api/v2/book/{book_id}/authors";
const BOOK_ACTIVITY_KEY = "/api/v2/book/{book_id}/activity";
const WORD_CLOUD_KEY = "/api/v2/wordCloud";
const BOOKMARK_KEY = "/api/v2/bookmark";
const TOPIC_KEY = "/api/v2/topic/{topic_id}";
const TOPIC_AUTHORS_KEY = "/api/v2/topic/{topic_id}/authors";
const OEMBED_KEY = "/api/v2/resource/{resource_id}/oembed";
const SEARCH_KEY = "/api/v2/search";
const BOOK_IDS_KEY = "/api/v2/bookIds";

type CacheKey = Record<string, unknown> & { key: string };

function isCacheKey(key: unknown): key is CacheKey {
  return typeof key === "object" && key !== null && "key" in key;
}

function matchesBookId(key: CacheKey, bookId: BookSchema["id"]): boolean {
  return (
    "bookId" in key && (key as unknown as { bookId: number }).bookId === bookId
  );
}

function matchesTopicId(key: CacheKey, topicId: TopicSchema["id"]): boolean {
  return (
    "topicId" in key &&
    (key as unknown as { topicId: number }).topicId === topicId
  );
}

function matchesAnyTopicId(
  key: CacheKey,
  topicIds: TopicSchema["id"][]
): boolean {
  if (topicIds.length === 0) return false;
  if (topicIds.some((topicId) => matchesTopicId(key, topicId))) {
    return true;
  }
  if ("topicIds" in key) {
    const ids = (key as unknown as { topicIds: number[] }).topicIds;
    if (Array.isArray(ids)) {
      return ids.some((id) => topicIds.includes(id));
    }
  }
  return false;
}

function matchesResourceId(key: CacheKey, resourceId: number): boolean {
  return (
    "resourceId" in key &&
    (key as unknown as { resourceId: number }).resourceId === resourceId
  );
}

export function extractTopicIdsFromBook(book: BookSchema): TopicSchema["id"][] {
  return book.sections.flatMap((section) =>
    section.topics.map((topic) => topic.id)
  );
}

export function extractResourceIdsFromBook(book: BookSchema): number[] {
  const resourceIds = new Set<number>();
  for (const section of book.sections) {
    for (const topic of section.topics) {
      if (topic.resource?.id != null) {
        resourceIds.add(topic.resource.id);
      }
    }
  }
  return [...resourceIds];
}

async function clearCacheEntries(
  matcher: (key: unknown) => boolean
): Promise<void> {
  await mutate(matcher, undefined, CLEAR_OPTIONS);
}

export async function clearBookCaches(
  bookId: BookSchema["id"],
  options?: {
    topicIds?: TopicSchema["id"][];
    resourceIds?: number[];
  }
): Promise<void> {
  const topicIds = options?.topicIds ?? [];
  const resourceIds = options?.resourceIds ?? [];

  await clearCacheEntries(
    (key) =>
      isCacheKey(key) && key.key === BOOK_KEY && matchesBookId(key, bookId)
  );
  await clearCacheEntries(
    (key) =>
      isCacheKey(key) &&
      key.key === BOOK_RELEASE_KEY &&
      matchesBookId(key, bookId)
  );
  await clearCacheEntries(
    (key) =>
      isCacheKey(key) &&
      key.key === BOOK_AUTHORS_KEY &&
      matchesBookId(key, bookId)
  );
  await clearCacheEntries(
    (key) =>
      isCacheKey(key) &&
      key.key === BOOK_ACTIVITY_KEY &&
      matchesBookId(key, bookId)
  );
  await clearCacheEntries(
    (key) =>
      isCacheKey(key) &&
      key.key === WORD_CLOUD_KEY &&
      matchesBookId(key, bookId)
  );
  await clearCacheEntries(
    (key) =>
      isCacheKey(key) && key.key === BOOKMARK_KEY && matchesBookId(key, bookId)
  );

  if (topicIds.length > 0) {
    await clearCacheEntries(
      (key) =>
        isCacheKey(key) &&
        key.key === TOPIC_KEY &&
        matchesAnyTopicId(key, topicIds)
    );
    await clearCacheEntries(
      (key) =>
        isCacheKey(key) &&
        key.key === TOPIC_AUTHORS_KEY &&
        topicIds.some((topicId) => matchesTopicId(key, topicId))
    );
  }

  for (const resourceId of resourceIds) {
    await clearCacheEntries(
      (key) =>
        isCacheKey(key) &&
        key.key === OEMBED_KEY &&
        matchesResourceId(key, resourceId)
    );
  }
}

export async function clearSearchCaches(): Promise<void> {
  await clearCacheEntries((key) => isCacheKey(key) && key.key === SEARCH_KEY);
}

export async function clearBookIdsCache(): Promise<void> {
  await mutate(BOOK_IDS_KEY, undefined, CLEAR_OPTIONS);
}

export async function clearBookCachesFromBook(
  book: BookSchema,
  options?: { withTopics?: boolean }
): Promise<void> {
  const withTopics = options?.withTopics ?? true;
  await clearBookCaches(book.id, {
    topicIds: withTopics ? extractTopicIdsFromBook(book) : [],
    resourceIds: withTopics ? extractResourceIdsFromBook(book) : [],
  });
}
