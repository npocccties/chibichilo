import { useSWRInfinite } from "swr";
import type { TopicSchema } from "$server/models/topic";
import { api } from "./api";
import useInfiniteProps from "./useInfiniteProps";
import { revalidateTopic } from "./topic";
import { SortOrder } from "$server/models/sortOrder";

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
  sort: string,
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

const filter = (
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) => (topic: TopicSchema | undefined) => {
  if (topic === undefined) return [];
  if (!sharedOrCreatedBy(topic, isTopicEditable)) return [];
  return [topic];
};

export function useTopics(
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) {
  const res = useSWRInfinite<TopicSchema[]>(
    makeKey("updated", 20),
    fetchTopics
  );
  const topics = res.data?.flat().flatMap(filter(isTopicEditable)) ?? [];
  return { topics, ...useInfiniteProps(res) };
}
