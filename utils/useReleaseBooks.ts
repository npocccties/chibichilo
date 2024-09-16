import useSWR from "swr";
import type { BookSchema } from "$server/models/book";
import { api } from "./api";
import type { ReleaseItemSchema } from "$server/models/releaseResult";

const key = "/api/v2/book/{book_id}/release";

async function fetchReleaseBooks({
  bookId,
}: {
  key: typeof key;
  bookId: BookSchema["id"];
}) {
  const { releases } = await api.apiV2BookBookIdReleaseGet({ bookId });
  return releases as unknown as Array<ReleaseItemSchema>;
}

function useReleaseBooks(bookId: BookSchema["id"]) {
  const { data, error } = useSWR({ key, bookId }, fetchReleaseBooks);
  return { releases: data, error };
}

export default useReleaseBooks;
