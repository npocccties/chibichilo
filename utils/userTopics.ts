import { useSWRInfinite } from "swr";
import type { SortOrder } from "$server/models/sortOrder";
import type { UserSchema } from "$server/models/user";
import type { TopicSchema } from "$server/models/topic";
import { api } from "./api";
import useInfiniteProps from "./useInfiniteProps";

const key = "/api/v2/user/{user_id}/topics";

const makeKey = (
  userId: UserSchema["id"],
  sort: SortOrder,
  perPage: number
) => (
  page: number,
  prev: TopicSchema[] | null
): Parameters<typeof fetchUserTopics> | null => {
  if (prev && prev.length === 0) return null;
  return [key, userId, sort, perPage, page];
};

async function fetchUserTopics(
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

export function useUserTopics(userId: UserSchema["id"]) {
  const res = useSWRInfinite<TopicSchema[]>(
    makeKey(userId, "updated", 20),
    fetchUserTopics
  );
  const topics = res.data?.flatMap((topics) => topics) ?? [];
  return { topics, ...useInfiniteProps(res) };
}
