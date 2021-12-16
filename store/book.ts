import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { RESET, atomWithReset, useUpdateAtom, useAtomValue } from "jotai/utils";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";

type BookState = {
  book: BookSchema | undefined;
  itemIndex: ItemIndex;
  itemExists(itemIndex: ItemIndex): TopicSchema | undefined;
};

const bookAtom = atomWithReset<BookState>({
  book: undefined,
  itemIndex: [0, 0],
  itemExists: () => undefined,
});

const nextItemIndexAtom = atom((get) => {
  const { itemIndex, itemExists } = get(bookAtom);
  const [prevSectionIndex, prevTopicIndex] = itemIndex;
  const nextTopicIndex = [prevSectionIndex, prevTopicIndex + 1] as const;
  const nextSectionIndex = [prevSectionIndex + 1, 0] as const;

  if (itemExists(nextTopicIndex)) return nextTopicIndex;
  if (itemExists(nextSectionIndex)) return nextSectionIndex;

  return itemIndex;
});

const updateBookAtom = atom<undefined, BookState["book"]>(
  () => undefined,
  (_, set, book) => {
    set(bookAtom, {
      book,
      itemIndex: [0, 0],
      itemExists: ([sectionIndex, topicIndex]) =>
        book?.sections[sectionIndex]?.topics[topicIndex],
    });
  }
);

const updateItemIndexAtom = atom<undefined, ItemIndex | undefined>(
  () => undefined,
  (get, set, itemIndex = get(nextItemIndexAtom)) => {
    const { book, itemExists } = get(bookAtom);
    if (itemExists(itemIndex)) {
      set(bookAtom, { book, itemIndex, itemExists });
    }
  }
);

export function useBookAtom() {
  const [state, reset] = useAtom(bookAtom);
  const nextItemIndex = useAtomValue(nextItemIndexAtom);
  const updateBook = useUpdateAtom(updateBookAtom);
  const updateItemIndex = useUpdateAtom(updateItemIndexAtom);
  useEffect(
    () => () => {
      reset(RESET);
    },
    [reset]
  );
  return { ...state, updateBook, updateItemIndex, nextItemIndex };
}
