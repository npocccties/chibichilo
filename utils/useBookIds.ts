import useSWR from "swr";
import { api } from "$utils/api";

const key = "/api/v2/bookIds";

async function fetchBookIds(_: typeof key): Promise<string[]> {
  const { bookIds } = await api.apiV2BookIdsGet();
  return bookIds as string[];
}

const initialData: string[] = [];

function useBookIds() {
  const { data } = useSWR(key, fetchBookIds);
  return data ?? initialData;
}

export default useBookIds;
