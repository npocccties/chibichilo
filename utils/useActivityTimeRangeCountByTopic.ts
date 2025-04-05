import type { TopicSchema } from "$server/models/topic";
import fetchActivityTimeRangeCountByTopic from "$utils/fetchActivityTimeRangeCountByTopic";
import useSWR from "swr";

const key = "/api/v2/activityTimeRangeCountByTopic";

/**
 *繰返視聴割合を取得する
 */
function useActivityTimeRangeCountByTopic(
  topicId: TopicSchema["id"],
  currentLtiContextOnly: boolean
) {
  const { data, error } = useSWR(
    { key, topicId, currentLtiContextOnly },
    fetchActivityTimeRangeCountByTopic
  );
  return { data, error };
}

export default useActivityTimeRangeCountByTopic;
