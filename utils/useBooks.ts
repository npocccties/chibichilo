import { useMemo } from "react";
import { useSWRInfinite } from "swr";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { UserSchema } from "$server/models/user";
import type { Filter } from "$types/filter";
import { useSessionAtom } from "$store/session";
import getDisplayableBook from "./getDisplayableBook";
import useSortOrder from "./useSortOrder";
import useInfiniteProps from "./useInfiniteProps";
import useFilter from "./useFilter";
import bookCreateBy from "./bookCreateBy";
import { makeUserBooksKey, fetchUserBooks } from "./userBooks";
import { makeBooksKey, fetchBooks } from "./books";

const makeFilter = (
  filter: Filter,
  userId: UserSchema["id"],
  isBookEditable: (book: Pick<BookSchema, "author">) => boolean,
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) => (book: BookSchema | undefined) => {
  if (book === undefined) return [];
  const isMyBook = bookCreateBy(book, { id: userId });
  if (filter === "other" && isMyBook) return [];
  const displayable = getDisplayableBook(book, isBookEditable, isTopicEditable);
  return displayable == null ? [] : [displayable];
};

function useBooks() {
  const { session, isBookEditable, isTopicEditable } = useSessionAtom();
  const [sort, onSortChange] = useSortOrder();
  const [filter, onFilterChange] = useFilter();

  const userId = session?.user.id ?? NaN;
  const isUserBooks = filter === "self";
  const { key, fetch } = useMemo(
    () =>
      isUserBooks
        ? { key: makeUserBooksKey(userId, sort), fetch: fetchUserBooks }
        : { key: makeBooksKey(sort), fetch: fetchBooks },
    [isUserBooks, userId, sort]
  );
  const bookFilter = useMemo(
    () => makeFilter(filter, userId, isBookEditable, isTopicEditable),
    [filter, userId, isBookEditable, isTopicEditable]
  );
  const res = useSWRInfinite<BookSchema[]>(key, fetch);
  const books = res.data?.flat().flatMap(bookFilter) ?? [];
  return { books, onSortChange, onFilterChange, ...useInfiniteProps(res) };
}

export default useBooks;
