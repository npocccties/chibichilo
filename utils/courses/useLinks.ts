import useSWR, { mutate } from "swr";
import type { ApiV2LtiSearchGetSortEnum } from "$openapi";
import type { LinkSearchResultSchema } from "$server/models/link/search";
import { useLinkSearchAtom } from "$store/linkSearch";
import { api } from "$utils/api";

type SortOrder = "created" | "reverse-created";

const key = "/api/v2/lti/search";

async function fetchLinks(
  _: typeof key,
  query: { q: string; sort: SortOrder; perPage: number; page: number }
): Promise<LinkSearchResultSchema> {
  const res: LinkSearchResultSchema = (await api.apiV2LtiSearchGet({
    ...query,
    sort: query.sort as ApiV2LtiSearchGetSortEnum,
  })) as unknown as LinkSearchResultSchema;
  return res;
}

function useLinks() {
  const { query } = useLinkSearchAtom();
  const { data, isValidating } = useSWR([key, query], fetchLinks);
  const totalCount = data?.totalCount ?? 0;
  const contents = data?.contents ?? [];
  const loading = isValidating && data != null;
  return { ...data, totalCount, contents, loading };
}

export default useLinks;

export function revalidateLinks(query: {
  q: string;
  sort: SortOrder;
  perPage: number;
  page: number;
}): Promise<LinkSearchResultSchema> {
  return mutate([key, query]);
}
