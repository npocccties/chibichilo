import useSWR from "swr";
import type { LearnerSchema } from "$server/models/learner";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { BookActivitySchema } from "$server/models/bookActivity";
import { api } from "./api";
import { useLtiContextAtom } from "$store/session";

const key = "/api/v2/activity";

async function fetchActivity({
  currentLtiContextOnly,
  ltiConsumerId,
  ltiContextId,
}: {
  key: typeof key;
  currentLtiContextOnly: boolean;
  ltiConsumerId?: string | null;
  ltiContextId?: string | null;
}) {
  const res = await api.apiV2ActivityGet({
    currentLtiContextOnly,
    ...(currentLtiContextOnly && ltiConsumerId && ltiContextId
      ? { ltiConsumerId, ltiContextId }
      : {}),
  });
  const learners = res["learners"] as Array<LearnerSchema>;
  const courseBooks = res["courseBooks"] as Array<CourseBookSchema>;
  const bookActivities = res["bookActivities"] as Array<BookActivitySchema>;

  return { learners, courseBooks, bookActivities };
}

/**
 * 学習活動を取得する
 * @param currentLtiContextOnly 学習活動の LTI Context ごとでの取得
 */
function useActivity(currentLtiContextOnly: boolean) {
  const { ltiConsumerId, ltiContextId } = useLtiContextAtom();

  const { data, error } = useSWR(
    { key, currentLtiContextOnly, ltiConsumerId, ltiContextId },
    fetchActivity,
    { revalidateOnFocus: false }
  );
  return { data, error };
}

export default useActivity;
