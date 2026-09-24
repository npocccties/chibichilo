import { useEffect } from "react";
import useUnmount from "$utils/useUnmount";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import { pauseOthersAtom, preloadVideoAtom } from "$store/video";

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
  (get, set, book) => {
    const prev = get(bookAtom);
    const itemExists = ([sectionIndex, topicIndex]: ItemIndex) =>
      book.sections[sectionIndex]?.topics[topicIndex];

    let itemIndex = prev.itemIndex;
    if (!itemExists(itemIndex)) {
      itemIndex = itemExists([0, 0]) ? [0, 0] : [-1, -1];
    }

    set(bookAtom, {
      book,
      itemIndex,
      itemExists,
    });

    // ブック確定時にプレイヤープールを同期
    set(preloadVideoAtom, book.sections);
    const topic = itemExists(itemIndex);
    if (topic) set(pauseOthersAtom, String(topic.id));
  }
);

const updateItemIndexAtom = atom<undefined, [ItemIndex] | [], void>(
  () => undefined,
  (get, set, itemIndex = get(nextItemIndexAtom)) => {
    const { book, itemExists } = get(bookAtom);
    if (!itemExists(itemIndex)) return;

    set(bookAtom, { book, itemIndex, itemExists });

    // トピック切替コマンド: 前の動画再生を破棄（現在動画の autoplay は VideoPlayer 側）
    const topic = itemExists(itemIndex);
    if (topic) set(pauseOthersAtom, String(topic.id));
  }
);

export function useBookAtom(book?: BookSchema) {
  const state = useAtomValue(bookAtom);
  const reset = useResetAtom(bookAtom);
  const nextItemIndex = useAtomValue(nextItemIndexAtom);
  const updateBook = useSetAtom(updateBookAtom);
  const updateItemIndex = useSetAtom(updateItemIndexAtom);
  useEffect(() => {
    if (book && book !== state.book) {
      updateBook(book);
    }
  }, [updateBook, book, state.book]);
  useUnmount(() => {
    // `useBookAtom()` is also used as a reader by nested components.
    // Only the owner that provided a book should reset the global book state.
    if (book) reset();
  });
  return { ...state, updateItemIndex, nextItemIndex };
}
