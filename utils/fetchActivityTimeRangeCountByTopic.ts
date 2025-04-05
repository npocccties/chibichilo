import { api } from "./api";

export async function fetchActivityTimeRangeCountByTopic({
  topicId,
  currentLtiContextOnly,
}: {
  topicId: number;
  currentLtiContextOnly: boolean;
}) {
  const res = await api.apiV2ActivityTimeRangeCountByTopicTopicIdGet({
    topicId: topicId,
    currentLtiContextOnly: currentLtiContextOnly,
  });
  return res;
}

export default fetchActivityTimeRangeCountByTopic;
