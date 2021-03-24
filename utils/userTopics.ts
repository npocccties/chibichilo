import type { SortOrder } from "$server/models/sortOrder";
import type { UserSchema } from "$server/models/user";
import type { TopicSchema } from "$server/models/topic";
import { api } from "./api";

const key = "/api/v2/user/{user_id}/topics";

export const makeUserTopicsKey = (
  userId: UserSchema["id"],
  sort: SortOrder,
  perPage: number
) => (
  page: number,
  prev: TopicSchema[] | null
): Parameters<typeof fetchUserTopics> | null => {
  if (Number.isNaN(userId)) return null;
  if (prev && prev.length === 0) return null;
  return [key, userId, sort, perPage, page];
};

export async function fetchUserTopics(
  _: typeof key,
  userId: UserSchema["id"],
  sort: SortOrder,
  perPage: number,
  page: number
) {
  const res = await api.apiV2UserUserIdTopicsGet({
    userId,
    sort,
    perPage,
    page,
  });
  return res.topics as TopicSchema[];
}
