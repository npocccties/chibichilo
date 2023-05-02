import useSWR from "swr";
import type { BookSchema } from "$server/models/book";
import { api } from "./api";
import type { TreeResultSchema } from "$server/models/book/tree";

const key = "/api/v2/book/{book_id}/tree";

async function fetchBookTree({
  bookId,
}: {
  key: typeof key;
  bookId: BookSchema["id"];
}) {
  const tree = await api.apiV2BookBookIdTreeGet({ bookId });
  return tree as unknown as TreeResultSchema;
}

function useBookTree(bookId: BookSchema["id"]) {
  const { data, error } = useSWR({ key, bookId }, fetchBookTree);
  return { tree: data, error };
}

export default useBookTree;
