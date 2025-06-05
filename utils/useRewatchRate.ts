import fetchRewatchRate from "$utils/fetchRewatchRate";
import useSWR from "swr";

const key = "/api/v2/activityRewatchRate";

/**
 *繰返視聴割合を取得する
 */
function useRewatchRate(currentLtiContextOnly: boolean) {
  const { data, error } = useSWR(
    { key, currentLtiContextOnly },
    fetchRewatchRate,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    }
  );
  return { data, error };
}

export default useRewatchRate;
