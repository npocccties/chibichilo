import type {
  BooksImportParams,
  BooksImportResult,
} from "$server/models/booksImportParams";
import { api } from "./api";
import {
  clearBookCaches,
  clearBookCachesFromBook,
  clearBookIdsCache,
  clearSearchCaches,
} from "./invalidateBookCache";

async function importBook(
  bookId: number,
  body: BooksImportParams
): Promise<BooksImportResult> {
  const res = (await api.apiV2BookBookIdImportPost({
    bookId,
    body,
  })) as BooksImportResult;
  await clearSearchCaches();
  await clearBookIdsCache();
  const importedBook = res.books?.[0];
  if (importedBook) {
    await clearBookCachesFromBook(importedBook);
  } else {
    await clearBookCaches(bookId);
  }
  return res;
}

export default importBook;
