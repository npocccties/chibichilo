import useSWR from "swr";
import type { Session } from "$server/utils/session";
import { InlineResponse2004ToJSON } from "$openapi/models";
import { api } from "./api";

export * from "$server/utils/session";

export function useSession() {
  return useSWR<Session>("/api/v2/session", async () => {
    const body = await api.apiV2SessionGet();
    return InlineResponse2004ToJSON(body);
  });
}

export function normalizeRoles(roles: string) {
  return roles
    .replace(/[^,]+\//g, "")
    .toLowerCase()
    .split(",");
}
