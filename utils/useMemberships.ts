import type { LtiMemberShipSchema } from "$server/models/ltiMemberShip";
import useSWR from "swr";
import { api } from "./api";

const key = "/api/v2/memberships";

async function fetchMemberships(_: typeof key) {
  const memberships: unknown = await api.apiV2LtiMembershipGet();
  return memberships as LtiMemberShipSchema;
}

/**
 *LTI Names and Role Provisioning Service ParameterでLMSメンバーを取得する
 */
function useMemberships() {
  const { data, error } = useSWR([key], fetchMemberships);
  return { data, error };
}

export default useMemberships;
