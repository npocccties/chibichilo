import Download from "$templates/Download";
import Placeholder from "$templates/Placeholder";
import Problem from "$organisms/Problem";
import { useSessionAtom } from "$store/session";
import useActivity from "$utils/useActivity";
import { isAdministrator } from "$utils/session";

function Index() {
  const { session } = useSessionAtom();
  const { data, error } = useActivity();

  if (error) return <Problem title="学習分析データの取得に失敗しました" />;
  if (!session || !isAdministrator(session))
    return <Problem title="管理者のみアクセス可能です" />;
  if (!data) return <Placeholder />;

  return <Download session={session} {...data} />;
}

export default Index;
