import type { LinkedBook } from "$types/linkedBook";
import { useSessionAtom, useLtiContextAtom } from "$store/session";
import { useBook } from "./book";

function useLinkedBook() {
  const { isContentEditable } = useSessionAtom();
  const ltiContext = useLtiContextAtom();
  const { book, error } = useBook(
    ltiContext?.ltiResourceLink?.bookId,
    isContentEditable,
    ltiContext?.ltiResourceLink
  );
  const linkedBook: LinkedBook | undefined = book && {
    ...book,
    editable: isContentEditable(book),
  };
  return { linkedBook, error };
}

export default useLinkedBook;
