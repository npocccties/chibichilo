import type { SortOrder } from "$server/models/sortOrder";
import type { TopicSchema } from "$server/models/topic";
import { api } from "./api";
import { revalidateTopic } from "./topic";

const key = "/api/v2/topics";

export const makeTopicsKey = (sort: SortOrder, perPage: number) => (
  page: number,
  prev: TopicSchema[] | null
): Parameters<typeof fetchTopics> | null => {
  if (prev && prev.length === 0) return null;
  return [key, sort, perPage, page];
};

export async function fetchTopics(
  _: typeof key,
  sort: SortOrder,
  perPage: number,
  page: number
): Promise<TopicSchema[]> {
  const res = await api.apiV2TopicsGet({ sort, perPage, page });
  const topics = (res["topics"] ?? []) as TopicSchema[];
  await Promise.all(topics.map((t) => revalidateTopic(t.id, t)));
  return topics;
}
