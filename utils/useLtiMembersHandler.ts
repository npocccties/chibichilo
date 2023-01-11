import { useCallback } from "react";
import { mutate } from "swr";
import { api } from "./api";

const key = "/api/v2/ltiMember";

export async function updateLtiMembers({
  ltiUserIds,
}: {
  ltiUserIds: string[];
}) {
  const res = await api.apiV2LtiMembersPut({
    body: { lti_user_ids: ltiUserIds },
  });
  return await mutate(key, res);
}

function useLtiMembersHandler() {
  const handler = useCallback(
    async ({ ltiUserIds }: { ltiUserIds: string[] }) => {
      return await updateLtiMembers({ ltiUserIds });
    },
    []
  );
  return handler;
}

export default useLtiMembersHandler;
