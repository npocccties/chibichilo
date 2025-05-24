import Download from "$templates/Download";
import Placeholder from "$templates/Placeholder";
import Problem from "$organisms/Problem";
import { useSessionAtom } from "$store/session";
import useDownloadData from "$utils/useDownloadData";
import { isAdministrator } from "$utils/session";
import type { LearnerSchema } from "$server/models/learner";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { BookActivitySchema } from "$server/models/bookActivity";

function Index() {
  const { session } = useSessionAtom();
  const { data, error } = useDownloadData();

  const learners = data
    ? ([
        ...new Set(data.map((res) => res["learners"]).flat()),
      ] as Array<LearnerSchema>)
    : [];
  const courseBooks = data
    ? ([
        ...new Set(data.map((res) => res["courseBooks"]).flat()),
      ] as Array<CourseBookSchema>)
    : [];
  const bookActivities = data
    ? ([
        ...new Set(data.map((res) => res["bookActivities"]).flat()),
      ] as Array<BookActivitySchema>)
    : [];

  if (error) return <Problem title="学習分析データの取得に失敗しました" />;
  if (!session || !isAdministrator(session))
    return <Problem title="管理者のみアクセス可能です" />;
  if (!data) return <Placeholder />;

  return (
    <Download
      session={session}
      {...{ learners, courseBooks, bookActivities }}
    />
  );
}

export default Index;
