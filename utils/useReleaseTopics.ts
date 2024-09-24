import useSWR from "swr";
import { api } from "./api";
import type { ReleaseItemSchema } from "$server/models/releaseResult";
import type { TopicSchema } from "$server/models/topic";

const key = "/api/v2/book/{book_id}/release";

async function fetchReleaseTopics({
  topicId,
}: {
  key: typeof key;
  topicId: TopicSchema["id"];
}) {
  const { releases } = await api.apiV2TopicTopicIdReleaseGet({ topicId });
  return releases as unknown as Array<ReleaseItemSchema>;
}

function useReleaseTopics(topicId: TopicSchema["id"]) {
  const { data, error } = useSWR({ key, topicId }, fetchReleaseTopics);
  return { releases: data, error };
}

export default useReleaseTopics;
