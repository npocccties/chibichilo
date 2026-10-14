import type {
  BooksImportParams,
  BooksImportResult,
} from "$server/models/booksImportParams";
import { api } from "./api";
import {
  clearBookCachesFromBook,
  clearBookIdsCache,
  clearSearchCaches,
} from "./invalidateBookCache";

async function importBooks(
  body: BooksImportParams
): Promise<BooksImportResult> {
  const res = (await api.apiV2BooksImportPost({
    body,
  })) as BooksImportResult;
  await clearSearchCaches();
  await clearBookIdsCache();
  await Promise.all(
    (res.books ?? []).map((book) => clearBookCachesFromBook(book))
  );
  return res;
}

export default importBooks;
