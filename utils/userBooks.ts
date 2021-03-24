import type { SortOrder } from "$server/models/sortOrder";
import type { UserSchema } from "$server/models/user";
import type { BookSchema } from "$server/models/book";
import { api } from "./api";

const key = "/api/v2/user/{user_id}/books";

export const makeUserBooksKey = (userId: UserSchema["id"], sort: SortOrder) => (
  page: number,
  prev: BookSchema[] | null
): Parameters<typeof fetchUserBooks> | null => {
  if (prev && prev.length === 0) return null;
  return [key, userId, sort, page];
};

export async function fetchUserBooks(
  _: typeof key,
  userId: UserSchema["id"],
  sort: SortOrder,
  page: number
) {
  const res = await api.apiV2UserUserIdBooksGet({ userId, sort, page });
  return res.books as BookSchema[];
}
