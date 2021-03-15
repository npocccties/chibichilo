import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import type { SessionSchema } from "$server/models/session";
import { useUpdateSessionAtom } from "$store/session";
import { api } from "./api";

export * from "$server/utils/session";

const key = "/api/v2/session";

export function useSessionInit() {
  const { data, error } = useSWR<SessionSchema>(key, async () => {
    const res = await api.apiV2SessionGetRaw();
    return res.raw.json();
  });
  const [state, update] = useUpdateSessionAtom();
  useEffect(() => {
    update({
      session: data,
      error: Boolean(error),
    });
  }, [data, error, update]);

  return state;
}

export function revalidateSession(): Promise<SessionSchema> {
  return mutate(key);
}
