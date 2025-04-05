import useSWR from "swr";
import { api } from "$utils/api";

const key = "/api/v2/lti/contexts";

async function fetchContext(_: typeof key) {
  const { ltiContexts } = await api.apiV2LtiContextsGet();
  return ltiContexts;
}

function useContext() {
  const { data } = useSWR(key, fetchContext);
  return data ?? [];
}

export default useContext;
