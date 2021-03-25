import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { RESET, atomWithReset, useUpdateAtom } from "jotai/utils";
import clsx from "clsx";
import { Query } from "$utils/search/query";
import parse from "$utils/search/parse";
import stringify from "$utils/search/stringify";
import { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";

const queryAtom = atomWithReset<{ input: string } & Query>({
  input: "",
  keywords: [],
  ltiResourceLinks: [],
});

const updateQueryAtom = atom<null, string>(null, (_, set, input) => {
  set(queryAtom, { input, ...parse(input) });
});

const addLtiContextQueryAtom = atom<
  null,
  Pick<LtiResourceLinkSchema, "consumerId" | "contextId">
>(null, (get, set, link) => {
  const { input, keywords, ltiResourceLinks } = get(queryAtom);
  set(queryAtom, {
    input: clsx(input, stringify(link)),
    ltiResourceLinks: [...ltiResourceLinks, link],
    keywords,
  });
});

export function useSearchAtom() {
  const [query, reset] = useAtom(queryAtom);
  const onSearchInput = useUpdateAtom(updateQueryAtom);
  const onLtiContextClick = useUpdateAtom(addLtiContextQueryAtom);
  useEffect(
    () => () => {
      reset(RESET);
    },
    [reset]
  );
  return { query, onSearchInput, onLtiContextClick };
}
