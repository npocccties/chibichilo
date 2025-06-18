import type { BookSchema } from "$server/models/book";
import useReleaseBooks from "./useReleaseBooks";

function useParentBookInfo(bookId: BookSchema["id"]) {
  const { releases, error } = useReleaseBooks(bookId);

  if (error) {
    return undefined;
  }
  const self = releases?.find((e) => e.id === bookId);
  const parent = releases?.find((e) => self?.pid && self?.pid === e.vid);
  return parent;
}

export default useParentBookInfo;
