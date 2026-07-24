import useSWR from "swr";
import type { LearnerSchema } from "$server/models/learner";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { BookActivitySchema } from "$server/models/bookActivity";
import { api } from "./api";

const key = "/api/v2/activity";

async function fetchActivity({
  currentLtiContextOnly,
}: {
  key: typeof key;
  currentLtiContextOnly: boolean;
}) {
  const res = await api.apiV2ActivityGet({ currentLtiContextOnly });
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
  const { data, error } = useSWR({ key, currentLtiContextOnly }, fetchActivity);
  return { data, error };
}

export default useActivity;
