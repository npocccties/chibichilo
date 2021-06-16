import { LinkedBook } from "$types/linkedBook";
import { useSessionAtom } from "$store/session";
import { useBook } from "./book";

function useLinkedBook() {
  const { session, isBookEditable, isTopicEditable } = useSessionAtom();
  const { book, error } = useBook(
    session?.ltiResourceLink?.bookId,
    isBookEditable,
    isTopicEditable,
    session?.ltiResourceLink
  );
  const linkedBook: LinkedBook | undefined = book && {
    ...book,
    editable: isBookEditable(book),
  };
  return { linkedBook, error };
}

export default useLinkedBook;
