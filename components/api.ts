import useSWR, { mutate, keyInterface } from "swr";
import { fetcherFn } from "swr/dist/types";
import { useSnackbar } from "material-ui-snackbar-provider";
import { useMemo } from "react";

const basePath = process.env.NEXT_PUBLIC_API_BASE_PATH || "";
const sessionPath = `${basePath}/call/session.php`;
const registContentsPath = `${basePath}/call/content_regist.php`;

export type SessionResponse = {
  id: string;
  role: "administrator" | "instructor" | "";
  contents?: number;
  lmsResource: string;
  lmsCourse: string;
};

export function jsonFetcher(input: RequestInfo, init?: RequestInit) {
  return fetch(input, init).then((r) => r.json());
}
export function textFetcher(input: RequestInfo, init?: RequestInit) {
  return fetch(input, init).then((r) => r.text());
}
export function postForm<T extends object>(
  req: T
): {
  method: "POST";
  body: FormData;
} {
  const form = new FormData();
  Object.entries(req).forEach(
    ([key, value]) => value === undefined || form.append(key, value)
  );
  return {
    method: "POST",
    body: form,
  };
}
export function postJson<T extends object>(
  req: T
): {
  method: "POST";
  headers: {
    "Content-Type": "application/json";
  };
  body: string;
} {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  };
}

type LinkedContentsResponse = {
  id: number;
  name: string;
};
export async function registContents(id: number, name: string) {
  await mutate(registContentsPath, async () => {
    const data = await textFetcher(
      registContentsPath,
      postForm({
        content_id: id,
      })
    );
    if (data !== "new" && data !== "update") throw new Error(data);
    const res: LinkedContentsResponse = { id, name };
    return res;
  });
  await mutate(sessionPath, (prev: SessionResponse) => ({
    ...prev,
    contents: id,
  }));
}

export function useShowRegistContents() {
  const { showMessage } = useSnackbar();
  const { data, error } = useSWR<LinkedContentsResponse>(registContentsPath);

  if (error) {
    console.error(error);
    showMessage("問題が発生しました");
  } else if (data) {
    showMessage(`「${data.name}」を紐づけました`);
    mutate(registContentsPath, () => null);
  }

  return { data, error };
}

export const useSession = () =>
  useSWR<SessionResponse>(sessionPath, jsonFetcher);

export type WithState<T> = T & { state: "pending" | "success" | "failure" };

export function makeFetcher<T extends object, U extends any[]>(
  fetcher: fetcherFn<T>,
  initialState: T
): (...args: U) => Promise<WithState<T>> {
  async function fetch(...args: U) {
    try {
      const res = await fetcher(...args);
      const state: WithState<T> = {
        ...initialState,
        ...res,
        state: "success",
      };
      return state;
    } catch {
      const state: WithState<T> = {
        ...initialState,
        state: "failure",
      };
      return state;
    }
  }
  return fetch;
}

export function useApi<T extends object, U extends any[]>(
  key: keyInterface,
  fetcher: (...args: U) => Promise<T>,
  initialState: WithState<T>
): WithState<T> {
  const fetch = useMemo(() => makeFetcher(fetcher, initialState), [
    fetcher,
    initialState,
  ]);
  const { data, error } = useSWR<WithState<T>>(key, fetch);
  const state: WithState<T> = data || initialState;
  if (error) {
    const failureState: WithState<T> = { ...state, state: "failure" };
    return failureState;
  }
  return state;
}
