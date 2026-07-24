import type {
  BooksImportParams,
  BooksImportResult,
} from "$server/models/booksImportParams";
import { api } from "./api";
import { revalidateBook } from "./book";

async function importBook(
  bookId: number,
  body: BooksImportParams
): Promise<BooksImportResult> {
  const res = await api.apiV2BookBookIdImportPost({ bookId, body });
  await revalidateBook(bookId);
  return res as BooksImportResult;
}

export default importBook;
