import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useBookAtom } from "$store/book";
import { api } from "./api";
import type { BookProps, BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { SectionSchema } from "$server/models/book/section";
import { createTopic } from "./topic";
import { revalidateSession } from "./session";

const key = "/api/v2/book/{book_id}";

async function fetchBook(_: typeof key, id: BookSchema["id"]) {
  const res = await api.apiV2BookBookIdGet({ bookId: id });
  return res as BookSchema;
}

export function useBook(id: BookSchema["id"]) {
  const { data, error } = useSWR<BookSchema>([key, id], fetchBook);
  const { updateBook, ...state } = useBookAtom();
  useEffect(() => {
    if (data) updateBook(data);
  }, [data, updateBook]);
  return { ...state, error };
}

export async function createBook(body: BookProps): Promise<BookSchema> {
  // @ts-expect-error NOTE: body.sections[].topics[].name のUnion型に null 含むか否か異なる
  const res = await api.apiV2BookPost({ body });
  await mutate([key, res.id], res);
  return res as BookSchema;
}

const sectionInput = (
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) => async (section: SectionSchema) => {
  const topics = await Promise.all(
    section.topics.map(async (topic) => {
      if (isTopicEditable(topic)) return topic;
      return createTopic(topic);
    })
  );
  return { ...section, topics };
};

async function connectOrCreateSections(
  sections: SectionSchema[],
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) {
  return Promise.all(sections.map(sectionInput(isTopicEditable)));
}

export async function connectOrCreateBook(
  book: BookSchema,
  isBookEditable: (book: Pick<BookSchema, "author">) => boolean,
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) {
  if (isBookEditable(book)) return book;
  const { ltiResourceLinks: _, ...bookProps } = book;
  // NOTE: 自身以外の作成したトピックの含まれるセクションに関しては、
  //       影響を及ぼすのを避ける目的でトピックを複製して更新
  const sections = await connectOrCreateSections(
    bookProps.sections,
    isTopicEditable
  );
  return createBook({ ...bookProps, sections });
}

export async function updateBook({
  id,
  ...body
}: BookProps & { id: BookSchema["id"] }): Promise<BookSchema> {
  // @ts-expect-error NOTE: body.sections[].topics[].name のUnion型に null 含むか否か異なる
  const res = await api.apiV2BookBookIdPut({ bookId: id, body });
  await mutate([key, res.id], res);
  return res as BookSchema;
}

export async function destroyBook(id: BookSchema["id"]) {
  await api.apiV2BookBookIdDelete({ bookId: id });
  await revalidateSession();
}

export function revalidateBook(
  id: BookSchema["id"],
  res?: BookSchema
): Promise<BookSchema> {
  return mutate([key, id], res);
}
