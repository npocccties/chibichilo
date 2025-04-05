import useSWRImmutable from "swr/immutable";
import { api } from "./api";

const key = "/api/v2/activity";

async function fetchActivityByConsumer({
  currentLtiContextOnly,
  ltiConsumerIds,
  ltiContextIds,
}: {
  key: typeof key;
  currentLtiContextOnly?: boolean | undefined;
  ltiConsumerIds?: Array<string> | undefined;
  ltiContextIds?: Array<string> | undefined;
}) {
  const courses =
    ltiConsumerIds
      ?.map((consumerId, i) => [
        consumerId,
        ltiContextIds ? ltiContextIds[i] : "",
      ])
      .filter(([consumer, context]) => consumer && context) ?? [];

  return Promise.all(
    courses?.map(([ltiConsumerId, ltiContextId]) =>
      api.apiV2ActivityGet({
        currentLtiContextOnly,
        ltiConsumerId,
        ltiContextId,
      })
    ) ?? []
  );
}

/**
 * 学習活動を取得する
 * @param currentLtiContextOnly 学習活動の LTI Context ごとでの取得
 * @param ltiConsumerIds 学習活動のConsumer IDリスト
 * @param ltiContextIds 学習活動のContext IDリスト
 */
function useActivityByConsumer(
  currentLtiContextOnly?: boolean | undefined,
  ltiConsumerIds?: Array<string> | undefined,
  ltiContextIds?: Array<string> | undefined
) {
  const { data, error } = useSWRImmutable(
    { key, currentLtiContextOnly, ltiConsumerIds, ltiContextIds },
    fetchActivityByConsumer
  );
  return { data, error };
}

export default useActivityByConsumer;
