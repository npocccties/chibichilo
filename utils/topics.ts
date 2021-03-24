import { useMemo } from "react";
import { useSWRInfinite } from "swr";
import type { SortOrder } from "$server/models/sortOrder";
import type { TopicSchema } from "$server/models/topic";
import type { UserSchema } from "$server/models/user";
import type { Filter } from "$types/filter";
import { useSessionAtom } from "$store/session";
import { api } from "./api";
import useSortOrder from "./useSortOrder";
import useInfiniteProps from "./useInfiniteProps";
import { revalidateTopic } from "./topic";
import useFilter from "./useFilter";
import topicCreateBy from "./topicCreateBy";

const key = "/api/v2/topics";

const makeKey = (sort: SortOrder, perPage: number) => (
  page: number,
  prev: TopicSchema[] | null
): Parameters<typeof fetchTopics> | null => {
  if (prev && prev.length === 0) return null;
  return [key, sort, perPage, page];
};

async function fetchTopics(
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

function sharedOrCreatedBy(
  topic: TopicSchema,
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) {
  return topic.shared || isTopicEditable(topic);
}

const makeFilter = (
  userId: UserSchema["id"] | undefined,
  filter: Filter,
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) => (topic: TopicSchema | undefined) => {
  if (topic === undefined) return [];
  const isMyTopic = topicCreateBy(topic, { id: userId ?? NaN });
  if (filter === "self" && !isMyTopic) return [];
  if (filter === "other" && isMyTopic) return [];
  if (!sharedOrCreatedBy(topic, isTopicEditable)) return [];
  return [topic];
};

export function useTopics() {
  const { session, isTopicEditable } = useSessionAtom();
  const [sort, onSortChange] = useSortOrder();
  const [filter, onFilterChange] = useFilter();
  const userId = session?.user.id;
  const topicFilter = useMemo(
    () => makeFilter(userId, filter, isTopicEditable),
    [userId, filter, isTopicEditable]
  );
  const res = useSWRInfinite<TopicSchema[]>(makeKey(sort, 20), fetchTopics);
  const topics = res.data?.flat().flatMap(topicFilter) ?? [];
  return { topics, onSortChange, onFilterChange, ...useInfiniteProps(res) };
}
