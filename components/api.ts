import useSWR, { keyInterface } from "swr";
import { fetcherFn } from "swr/dist/types";
import { useMemo } from "react";

const makeFetch = <T, U>(
  responseHandler: (res: Response) => Promise<T>,
  requestBuilder?: (req: U) => RequestInit
) => async (input: RequestInfo, init?: U) => {
  const res = await fetch(
    input,
    init && requestBuilder && requestBuilder(init)
  );
  if (!res.ok) throw new Error(res.statusText);
  return responseHandler(res);
};

function postForm<T extends object>(req: T) {
  const form = new FormData();
  Object.entries(req).forEach(
    ([key, value]) => value === undefined || form.append(key, value)
  );
  return {
    method: "POST",
    body: form,
  };
}

function postJson<T extends object>(req: T) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  };
}

export const fetchJson = makeFetch((res) => res.json());
export const postFormFetchJson = makeFetch((res) => res.json(), postForm);
export const postFormFetchText = makeFetch((res) => res.text(), postForm);
export const postJsonFetchText = makeFetch((res) => res.text(), postJson);

function withState<T extends object, U extends any[]>(
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
  const fetch = useMemo(() => withState(fetcher, initialState), [
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
