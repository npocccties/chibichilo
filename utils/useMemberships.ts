import type { LtiNrpsContextMembershipSchema } from "$server/models/ltiNrpsContextMembership";
import useSWR from "swr";
import { api } from "./api";

const key = "/api/v2/memberships";

async function fetchMemberships(_: typeof key) {
  const memberships: unknown = await api.apiV2LtiMembersGet();
  return memberships as LtiNrpsContextMembershipSchema;
}

/**
 *LTI Names and Role Provisioning Service ParameterでLMSメンバーを取得する
 */
function useMemberships() {
  const { data, error } = useSWR([key], fetchMemberships);
  return { data, error };
}

export default useMemberships;
