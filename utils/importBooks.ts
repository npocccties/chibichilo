import type {
  BooksImportParams,
  BooksImportResult,
} from "$server/models/booksImportParams";
import { api } from "./api";

async function importBooks(
  body: BooksImportParams
): Promise<BooksImportResult> {
  const res = await api.apiV2BooksImportPost({ body });
  return res as BooksImportResult;
}

export default importBooks;
