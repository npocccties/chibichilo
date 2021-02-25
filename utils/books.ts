import { useSWRInfinite } from "swr";
import type { SortOrder } from "$server/models/sortOrder";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import { api } from "./api";
import useInfiniteProps from "./useInfiniteProps";
import { revalidateBook } from "./book";

const key = "/api/v2/books";

const makeKey = (sort: SortOrder) => (
  page: number,
  prev: BookSchema[] | null
): Parameters<typeof fetchBooks> | null => {
  if (prev && prev.length === 0) return null;
  return [key, sort, page];
};

async function fetchBooks(
  _: typeof key,
  sort: string,
  page: number
): Promise<BookSchema[]> {
  const res = await api.apiV2BooksGet({ sort, page });
  const books = (res["books"] ?? []) as BookSchema[];
  await Promise.all(books.map((t) => revalidateBook(t.id, t)));
  return books;
}

function sharedOrCreatedBy(
  book: BookSchema,
  isBookEditable: (book: Pick<BookSchema, "author">) => boolean
) {
  return book.shared || isBookEditable(book);
}

const filter = (
  isBookEditable: (book: Pick<BookSchema, "author">) => boolean,
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) => (book: BookSchema | undefined) => {
  if (book === undefined) return [];
  if (!sharedOrCreatedBy(book, isBookEditable)) return [];
  const sections = book.sections.map((section) => {
    const topics = section.topics.filter(
      (topic) => topic.shared || isTopicEditable(topic)
    );
    return { ...section, topics };
  });
  return [{ ...book, sections }];
};

export function useBooks(
  isBookEditable: (book: Pick<BookSchema, "author">) => boolean,
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) {
  const res = useSWRInfinite<BookSchema[]>(makeKey("updated"), fetchBooks);
  const books =
    res.data?.flat().flatMap(filter(isBookEditable, isTopicEditable)) ?? [];
  return { books, ...useInfiniteProps(res) };
}
