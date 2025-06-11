import fetchRewatchRate from "$utils/fetchRewatchRate";
import useSWR from "swr";
import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";

const key = "/api/v2/activityRewatchRate";

/**
 *繰返視聴割合を取得する
 */
function useRewatchRate(currentLtiContextOnly: boolean) {
  const { data, error } = useSWR(
    NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD
      ? { key, currentLtiContextOnly }
      : null,
    fetchRewatchRate
  );
  return { data, error };
}

export default useRewatchRate;
