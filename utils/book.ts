import { useMemo } from "react";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";
import { api } from "./api";
import type { BookProps, BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { IsContentEditable } from "$server/models/content";
import { useSessionAtom } from "$store/session";
import { revalidateSession } from "./session";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import { getDisplayableBook } from "./displayableBook";

const key = "/api/v2/book/{book_id}";

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
  ltiResourceLink?: Pick<LtiResourceLinkSchema, "bookId" | "creatorId"> | null,
  token?: string
) {
  isContentEditable = useSessionAtom().isContentEditable;

  const { data, error } = useSWRImmutable<BookSchema>(
    Number.isFinite(bookId) || token ? { key, bookId, token } : null,
    fetchBook,
    { revalidateOnMount: true }
  );
  const publicBook = data?.publicBooks?.find(
    (publicBook) => publicBook.token === token
  );
  const displayable = useMemo(
    () =>
      getDisplayableBook(
        data,
        isContentEditable,
        ltiResourceLink ?? undefined,
        publicBook
      ),
    [data, isContentEditable, ltiResourceLink, publicBook]
  );

  return {
    book: displayable,
    error: (data !== undefined && displayable === undefined) || error,
  };
}

export async function createBook(body: BookProps): Promise<BookSchema> {
  // @ts-expect-error NOTE: body.sections[].topics[].name のUnion型に null 含むか否か異なる
  const res = await api.apiV2BookPost({ body });
  await mutate({ key, bookId: res.id }, res);
  return res as BookSchema;
}

export async function updateBook({
  id,
  ...body
}: BookProps & { id: BookSchema["id"] }): Promise<BookSchema> {
  // @ts-expect-error NOTE: body.sections[].topics[].name のUnion型に null 含むか否か異なる
  const res = await api.apiV2BookBookIdPut({ bookId: id, body });
  await mutate({ key, bookId: res.id }, res);
  return res as BookSchema;
}

export async function addTopicToBook(
  book: BookSchema,
  topic: Pick<TopicSchema, "id">
) {
  const sections = [
    ...book.sections,
    { name: null, topics: [{ id: topic.id }] },
  ];
  return updateBook({ ...book, sections });
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

export async function destroyBook(id: BookSchema["id"]) {
  await api.apiV2BookBookIdDelete({ bookId: id });
  await revalidateSession();
}

export function revalidateBook(
  id: BookSchema["id"],
  res?: BookSchema
): Promise<BookSchema | void> {
  return mutate({ key, bookId: id }, res);
}

export async function getBookIdByZoom(meetingId: number) {
  return await api.apiV2BookZoomMeetingIdGet({ meetingId });
}
