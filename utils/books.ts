import { useMemo } from "react";
import { useSWRInfinite } from "swr";
import type { SortOrder } from "$server/models/sortOrder";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { UserSchema } from "$server/models/user";
import type { Filter } from "$types/filter";
import { useSessionAtom } from "$store/session";
import { api } from "./api";
import getDisplayableBook from "./getDisplayableBook";
import useSortOrder from "./useSortOrder";
import useInfiniteProps from "./useInfiniteProps";
import { revalidateBook } from "./book";
import useFilter from "./useFilter";
import bookCreateBy from "./bookCreateBy";

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
  sort: SortOrder,
  page: number
): Promise<BookSchema[]> {
  const res = await api.apiV2BooksGet({ sort, page });
  const books = (res["books"] ?? []) as BookSchema[];
  await Promise.all(books.map((t) => revalidateBook(t.id, t)));
  return books;
}

const makeFilter = (
  userId: UserSchema["id"] | undefined,
  filter: Filter,
  isBookEditable: (book: Pick<BookSchema, "author">) => boolean,
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) => (book: BookSchema | undefined) => {
  if (book === undefined) return [];
  const isMyBook = bookCreateBy(book, { id: userId ?? NaN });
  if (filter === "self" && !isMyBook) return [];
  if (filter === "other" && isMyBook) return [];
  const displayable = getDisplayableBook(book, isBookEditable, isTopicEditable);
  return displayable == null ? [] : [displayable];
};

export function useBooks() {
  const { session, isBookEditable, isTopicEditable } = useSessionAtom();
  const [sort, onSortChange] = useSortOrder();
  const [filter, onFilterChange] = useFilter();
  const userId = session?.user.id;
  const bookFilter = useMemo(
    () => makeFilter(userId, filter, isBookEditable, isTopicEditable),
    [userId, filter, isBookEditable, isTopicEditable]
  );
  const res = useSWRInfinite<BookSchema[]>(makeKey(sort), fetchBooks);
  const books = res.data?.flat().flatMap(bookFilter) ?? [];
  return { books, onSortChange, onFilterChange, ...useInfiniteProps(res) };
}
