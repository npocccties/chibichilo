import { useMemo } from "react";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";
import { api } from "./api";
import type { BookProps, BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { IsContentEditable } from "$server/models/content";
import { useLtiContextAtom, useSessionAtom } from "$store/session";
import { revalidateSession } from "./session";
import {
  clearBookCaches,
  clearBookIdsCache,
  clearSearchCaches,
  extractResourceIdsFromBook,
  extractTopicIdsFromBook,
} from "./invalidateBookCache";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import { getDisplayableBook } from "./displayableBook";
import type { ReleaseProps, ReleaseSchema } from "$server/models/book/release";
import type { MetainfoProps } from "$server/models/metainfo";

const key = "/api/v2/book/{book_id}";

type BookCacheKey = {
  key: typeof key;
  bookId: BookSchema["id"];
  token?: string;
  ltiConsumerId?: string | null;
  ltiContextId?: string | null;
};

function isBookCacheKey(k: unknown): k is BookCacheKey {
  return (
    typeof k === "object" &&
    k !== null &&
    "key" in k &&
    (k as BookCacheKey).key === key &&
    "bookId" in k
  );
}

async function mutateBookCache(
  bookId: BookSchema["id"],
  data: BookSchema
): Promise<void> {
  await mutate((k) => isBookCacheKey(k) && k.bookId === bookId, data, {
    revalidate: false,
  });
}

async function fetchBook({
  bookId,
  token,
}: {
  key: typeof key;
  bookId: BookSchema["id"];
  token?: string;
}) {
  if (token) {
    const res = await api.apiV2BookPublicTokenGet({
      token,
      originreferer: document.referrer,
    });
    return res as BookSchema;
  } else {
    const res = await api.apiV2BookBookIdGet({ bookId });
    return res as BookSchema;
  }
}

export function useBook(
  bookId: BookSchema["id"] | undefined,
  isContentEditable?: IsContentEditable,
  ltiResourceLink?: Pick<
    LtiResourceLinkSchema,
    "bookId" | "creatorId" | "consumerId" | "contextId"
  > | null,
  token?: string
) {
  isContentEditable = useSessionAtom().isContentEditable;
  const { ltiConsumerId, ltiContextId } = useLtiContextAtom();
  const { data, error } = useSWRImmutable<BookSchema>(
    Number.isFinite(bookId) || token
      ? { key, bookId, token, ltiConsumerId, ltiContextId }
      : null,
    fetchBook,
    { revalidateOnMount: true }
  );

  const publicBook = data?.publicBooks?.find(
    (publicBook) => publicBook.token === token
  );

  const effectiveLtiResourceLink = useMemo(() => {
    if (
      ltiContextId &&
      bookId !== undefined &&
      ltiResourceLink?.bookId !== bookId
    ) {
      return {
        bookId: bookId,
        creatorId: ltiResourceLink?.creatorId ?? 0,
      };
    }
    return ltiResourceLink ?? undefined;
  }, [ltiContextId, bookId, ltiResourceLink]);

  const displayable = useMemo(
    () =>
      getDisplayableBook(
        data,
        isContentEditable,
        effectiveLtiResourceLink,
        publicBook
      ),
    [data, isContentEditable, effectiveLtiResourceLink, publicBook]
  );

  return {
    book: displayable,
    error: (data !== undefined && displayable === undefined) || error,
  };
}

export async function createBook(body: BookProps): Promise<BookSchema> {
  // @ts-expect-error NOTE: body.sections[].topics[].name のUnion型に null 含むか否か異なる
  const res = await api.apiV2BookPost({ body });
  const book = res as BookSchema;
  await mutateBookCache(book.id, book);
  return book;
}

export async function updateBook({
  id,
  noclone,
  ...body
}: BookProps & { id: BookSchema["id"] } & {
  noclone?: boolean;
}): Promise<BookSchema> {
  // @ts-expect-error NOTE: body.sections[].topics[].name のUnion型に null 含むか否か異なる
  const res = await api.apiV2BookBookIdPut({ bookId: id, body, noclone });
  const book = res as BookSchema;
  await mutateBookCache(id, book);
  return book;
}

export async function addTopicToBook(
  book: BookSchema,
  topic: Pick<TopicSchema, "id">
) {
  const sections = [
    ...book.sections,
    { name: null, topics: [{ id: topic.id }] },
  ];
  return updateBook({ ...book, sections, noclone: true });
}

export async function replaceTopicInBook(
  book: BookSchema,
  target: Pick<TopicSchema, "id">,
  by: Pick<TopicSchema, "id">
) {
  const sections = book.sections.map((section) => {
    const topics = section.topics.map((topic) =>
      topic.id === target.id ? by : topic
    );
    return { ...section, topics };
  });

  return updateBook({ ...book, sections });
}

export async function destroyBook(
  id: BookSchema["id"],
  withtopic: boolean,
  book?: BookSchema
) {
  const topicIds = withtopic && book ? extractTopicIdsFromBook(book) : [];
  const resourceIds = withtopic && book ? extractResourceIdsFromBook(book) : [];
  await api.apiV2BookBookIdDelete({ bookId: id, withtopic });
  await clearBookCaches(id, { topicIds, resourceIds });
  await clearSearchCaches();
  await clearBookIdsCache();
  await revalidateSession();
}

export async function revalidateBook(
  id: BookSchema["id"],
  res?: BookSchema
): Promise<BookSchema | void> {
  await mutate(
    (k) => isBookCacheKey(k) && k.bookId === id,
    res,
    res !== undefined ? { revalidate: false } : undefined
  );
  return res;
}

export async function getBookIdByZoom(meetingId: number) {
  return await api.apiV2BookZoomMeetingIdGet({ meetingId });
}

export async function updateReleaseBook({
  id,
  ...body
}: ReleaseProps & { id: BookSchema["id"] }): Promise<ReleaseSchema> {
  const res = await api.apiV2BookBookIdReleasePut({ bookId: id, body });
  return res as ReleaseSchema;
}

export async function createReleaseBook({
  id,
  ...body
}: ReleaseProps & { id: BookSchema["id"] }): Promise<BookSchema> {
  const res = await api.apiV2BookBookIdReleasePost({ bookId: id, body });
  return res as BookSchema;
}

export async function cloneBook(id: BookSchema["id"]): Promise<BookSchema> {
  const res = await api.apiV2BookBookIdClonePost({ bookId: id });
  return res as BookSchema;
}

export async function updateMetainfoBook(
  id: BookSchema["id"],
  body: MetainfoProps
): Promise<MetainfoProps> {
  const res = await api.apiV2BookBookIdMetainfoPut({ bookId: id, body });
  return res as MetainfoProps;
}
