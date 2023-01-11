import { useCallback } from "react";
import { mutate } from "swr";
import { api } from "./api";

const key = "/api/v2/ltiMember";

export async function updateLtiMembers({ userIds }: { userIds: string[] }) {
  const res = await api.apiV2LtiMembersPut({ body: { user_ids: userIds } });
  return await mutate(key, res);
}

function useLtiMembersHandler() {
  const handler = useCallback(async ({ userIds }: { userIds: string[] }) => {
    return await updateLtiMembers({ userIds });
  }, []);
  return handler;
}

export default useLtiMembersHandler;
