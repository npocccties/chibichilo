import useSWR from "swr";
import type { Session } from "$server/utils/session";
import { api } from "./api";

export * from "$server/utils/session";

export function useSession() {
  return useSWR<Session>("/api/v2/session", async () => {
    const res = await api.apiV2SessionGetRaw();
    return res.raw.json();
  });
}
