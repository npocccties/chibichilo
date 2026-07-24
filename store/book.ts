import { useEffect } from "react";
import { useUnmount } from "react-use";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";

type BookState = {
  book: BookSchema | undefined;
  itemIndex: ItemIndex;
  itemExists(itemIndex: ItemIndex): TopicSchema | undefined;
};

const bookAtom = atomWithReset<BookState>({
  book: undefined,
  itemIndex: [-1, -1],
  itemExists: () => undefined,
});

const nextItemIndexAtom = atom((get) => {
  const { itemIndex, itemExists } = get(bookAtom);
  const [prevSectionIndex, prevTopicIndex] = itemIndex;
  const nextTopicIndex = [prevSectionIndex, prevTopicIndex + 1] as const;
  const nextSectionIndex = [prevSectionIndex + 1, 0] as const;

  if (itemExists(nextTopicIndex)) return nextTopicIndex;
  if (itemExists(nextSectionIndex)) return nextSectionIndex;

  return [-1, -1] as const;
});

const updateBookAtom = atom<undefined, [BookSchema], void>(
  () => undefined,
  (_, set, book) => {
    set(bookAtom, {
      book,
      itemIndex: [-1, -1],
      itemExists: ([sectionIndex, topicIndex]) =>
        book.sections[sectionIndex]?.topics[topicIndex],
    });
  }
);

const updateItemIndexAtom = atom<undefined, [ItemIndex] | [], void>(
  () => undefined,
  (get, set, itemIndex = get(nextItemIndexAtom)) => {
    const { book, itemExists } = get(bookAtom);
    if (itemExists(itemIndex)) {
      set(bookAtom, { book, itemIndex, itemExists });
    }
  }
);

export function useBookAtom(book?: BookSchema) {
  const state = useAtomValue(bookAtom);
  const reset = useResetAtom(bookAtom);
  const nextItemIndex = useAtomValue(nextItemIndexAtom);
  const updateBook = useSetAtom(updateBookAtom);
  const updateItemIndex = useSetAtom(updateItemIndexAtom);
  useEffect(() => {
    if (book && book !== state.book) updateBook(book);
  }, [updateBook, book, state.book]);
  useUnmount(reset);
  return { ...state, updateItemIndex, nextItemIndex };
}
