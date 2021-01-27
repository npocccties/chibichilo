import useSWR from "swr";
import type { BookSchema } from "$server/models/book";
import { api } from "./api";
import { revalidateBook } from "./book";

const key = "/api/v2/books";

async function fetchBooks(_: typeof key, page = 0): Promise<BookSchema[]> {
  const res = await api.apiV2BooksGet({ page });
  const books = (res["books"] ?? []) as BookSchema[];
  await Promise.all(books.map((t) => revalidateBook(t.id, t)));
  return books;
}

export function useBooks() {
  const { data } = useSWR<BookSchema[]>(key, fetchBooks);
  return data;
}
