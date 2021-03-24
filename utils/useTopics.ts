import { useMemo } from "react";
import { useSWRInfinite } from "swr";
import type { TopicSchema } from "$server/models/topic";
import type { UserSchema } from "$server/models/user";
import type { Filter } from "$types/filter";
import { useSessionAtom } from "$store/session";
import useSortOrder from "./useSortOrder";
import useInfiniteProps from "./useInfiniteProps";
import useFilter from "./useFilter";
import topicCreateBy from "./topicCreateBy";
import { makeUserTopicsKey, fetchUserTopics } from "./userTopics";
import { makeTopicsKey, fetchTopics } from "./topics";

function sharedOrCreatedBy(
  topic: TopicSchema,
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) {
  return topic.shared || isTopicEditable(topic);
}

const makeFilter = (
  filter: Filter,
  userId: UserSchema["id"],
  isTopicEditable: (topic: Pick<TopicSchema, "creator">) => boolean
) => (topic: TopicSchema | undefined) => {
  if (topic === undefined) return [];
  const isMyTopic = topicCreateBy(topic, { id: userId ?? NaN });
  if (filter === "other" && isMyTopic) return [];
  if (!sharedOrCreatedBy(topic, isTopicEditable)) return [];
  return [topic];
};

function useTopics() {
  const { session, isTopicEditable } = useSessionAtom();
  const [sort, onSortChange] = useSortOrder();
  const [filter, onFilterChange] = useFilter();
  const userId = session?.user.id ?? NaN;
  const isUserTopics = filter === "self";
  const { key, fetch } = useMemo(
    () =>
      isUserTopics
        ? { key: makeUserTopicsKey(userId, sort, 20), fetch: fetchUserTopics }
        : { key: makeTopicsKey(sort, 20), fetch: fetchTopics },
    [isUserTopics, userId, sort]
  );
  const topicFilter = useMemo(
    () => makeFilter(filter, userId, isTopicEditable),
    [filter, userId, isTopicEditable]
  );
  const res = useSWRInfinite<TopicSchema[]>(key, fetch);
  const topics = res.data?.flat().flatMap(topicFilter) ?? [];
  return { topics, onSortChange, onFilterChange, ...useInfiniteProps(res) };
}

export default useTopics;
