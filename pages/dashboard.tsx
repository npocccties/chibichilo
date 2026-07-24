import { useState } from "react";
import type { ActivityScope } from "$types/activityScope";
import Dashboard from "$templates/Dashboard";
import Placeholder from "$templates/Placeholder";
import Problem from "$organisms/Problem";
import { useSessionAtom } from "$store/session";
import useActivity from "$utils/useActivity";
import { NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY } from "$utils/env";

function Index() {
  const { session } = useSessionAtom();
  const [scope, setScope] = useState<ActivityScope>(
    NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY ? "current-lti-context-only" : "topic"
  );
  const { data, error } = useActivity(scope === "current-lti-context-only");

  if (error) return <Problem title="学習分析データの取得に失敗しました" />;
  if (!session) return <Placeholder />;
  if (!data) return <Placeholder />;

  return (
    <Dashboard
      session={session}
      scope={scope}
      onScopeChange={setScope}
      {...data}
    />
  );
}

export default Index;
