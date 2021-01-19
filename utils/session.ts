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

export function formatRoles(roles: string) {
  const normalizedRoles = roles
    .replace(/[^,]+\//g, "")
    .toLowerCase()
    .split(",");
  if (normalizedRoles.includes("administrator")) return "管理者";
  if (normalizedRoles.includes("instructor")) return "教育者";
  if (normalizedRoles.includes("teaching assistant")) return "TA";
  if (normalizedRoles.includes("student")) return "学習者";
  return "不明なロール";
}
