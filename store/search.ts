import { useCallback, useEffect } from "react";
import { useUnmount } from "react-use";
import { atom, useAtom } from "jotai";
import { RESET, atomWithReset } from "jotai/utils";
import yn from "yn";
import { parse } from "search-query-parser";
import stringify from "$utils/search/stringify";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { KeywordSchema } from "$server/models/keyword";
import type { SortOrder } from "$server/models/sortOrder";
import type { AuthorFilterType } from "$server/models/authorFilter";
import type { SearchQueryBase } from "$server/models/searchQuery";
import type { SharedFilterType } from "$types/sharedFilter";
import type { SearchTarget } from "$types/searchTarget";
import type { RelatedBook } from "$server/models/topic";

const queryAtom = atom<{
  type: "none" | "book" | "topic";
  q: string;
  filter: AuthorFilterType;
  sort: SortOrder;
  perPage: number;
  page: number;
}>({
  type: "none",
  q: "",
  filter: "self",
  sort: "updated",
  perPage: 30,
  page: 0,
});

const searchQueryAtom = atomWithReset<
  Partial<
    Omit<SearchQueryBase, "link"> & { link: Array<LtiResourceLinkSchema> }
  >
>({});

const inputAtom = atom<string>("");

const targetAtom = atom<SearchTarget>("all");

const relatedBookAtom = atom<RelatedBook[]>([]);

const getInputQuery = (input: string, target: SearchTarget) => {
  const query = parse(input, { alwaysArray: true, tokenize: true });
  switch (target) {
    case "all":
      return query;
    case "keyword":
      return { "partial-keyword": query.text };
    default:
      return { [target]: query.text };
  }
};

export function useSearchAtom() {
  const [query, updateQuery] = useAtom(queryAtom);
  const [searchQuery, updateSearchQuery] = useAtom(searchQueryAtom);
  const [input, updateInput] = useAtom(inputAtom);
  const [target, updateTarget] = useAtom(targetAtom);
  const [relatedBooks, updateRelatedBooks] = useAtom(relatedBookAtom);
  useEffect(
    () =>
      updateQuery((query) => ({
        ...query,
        q: stringify({ ...searchQuery, ...getInputQuery(input, target) }),
        page: 0,
      })),
    [updateQuery, input, target, searchQuery]
  );
  const setType: (type: "book" | "topic") => void = useCallback(
    (type) => {
      updateQuery({
        type,
        q: "",
        filter: "edit",
        sort: "updated",
        perPage: 30,
        page: 0,
      });
      updateSearchQuery(RESET);
      updateInput("");
    },
    [updateQuery, updateSearchQuery, updateInput]
  );
  const setPage: (page: number) => void = useCallback(
    (page) => updateQuery((query) => ({ ...query, page })),
    [updateQuery]
  );
  const onSearchInput: (input: string) => void = useCallback(
    (input) => updateInput(input),
    [updateInput]
  );
  const onSearchSubmit: (input: string) => void = useCallback(
    (input) =>
      updateQuery((query) => ({
        ...query,
        q: stringify({ ...searchQuery, ...getInputQuery(input, target) }),
        page: 0,
      })),
    [updateQuery, target, searchQuery]
  );
  const onSearchInputReset: () => void = useCallback(() => {
    updateQuery((query) => ({
      ...query,
      q: stringify(searchQuery),
      page: 0,
    }));
    updateInput("");
  }, [updateQuery, searchQuery, updateInput]);
  const onSearchTargetChange: (target: SearchTarget) => void = useCallback(
    (target) => updateTarget(target),
    [updateTarget]
  );
  const onAuthorFilterChange: (filter: AuthorFilterType) => void = useCallback(
    (filter) => {
      updateQuery((query) => ({ ...query, filter, page: 0 }));
      // NOTE: 「著者:自分以外」and「共有:なし or すべて」は実用上無意味
      if (filter === "other") {
        updateSearchQuery((searchQuery) => ({
          ...searchQuery,
          shared: [true],
        }));
      }
    },
    [updateQuery, updateSearchQuery]
  );
  const onSharedFilterChange: (filter: SharedFilterType) => void = useCallback(
    (filter) => {
      const value = yn(filter);
      updateSearchQuery((searchQuery) => ({
        ...searchQuery,
        shared: typeof value === "boolean" ? [value] : [],
      }));
    },
    [updateSearchQuery]
  );
  const onLicenseFilterChange: (filter: string) => void = useCallback(
    (filter) => {
      const values = {
        [filter]: [filter],
        all: [],
      };
      updateSearchQuery((searchQuery) => ({
        ...searchQuery,
        license: values[filter],
      }));
    },
    [updateSearchQuery]
  );
  const onSortChange: (sort: SortOrder) => void = useCallback(
    (sort) => updateQuery((query) => ({ ...query, sort, page: 0 })),
    [updateQuery]
  );
  const onLtiContextClick: (link: LtiResourceLinkSchema) => void = useCallback(
    (link) => {
      if (
        searchQuery.link?.find(
          ({ contextId, consumerId }) =>
            contextId === link.contextId && consumerId === link.consumerId
        )
      )
        return;
      updateSearchQuery((searchQuery) => ({
        ...searchQuery,
        link: [...(searchQuery.link ?? []), link],
      }));
    },
    [searchQuery.link, updateSearchQuery]
  );
  const onLtiContextDelete: (link: LtiResourceLinkSchema) => void = useCallback(
    (removalLink) =>
      updateSearchQuery((searchQuery) => ({
        ...searchQuery,
        link: (searchQuery.link ?? []).filter(
          (link) => link.id != removalLink.id
        ),
      })),
    [updateSearchQuery]
  );
  const onKeywordClick: (keyword: KeywordSchema) => void = useCallback(
    (keyword) => {
      if (searchQuery.keyword?.includes(keyword.name)) return;
      updateSearchQuery((searchQuery) => ({
        ...searchQuery,
        keyword: [...(searchQuery.keyword ?? []), keyword.name],
      }));
    },
    [searchQuery.keyword, updateSearchQuery]
  );
  const onKeywordDelete: (keyword: string) => void = useCallback(
    (removalKeyword) =>
      updateSearchQuery((searchQuery) => ({
        ...searchQuery,
        keyword: (searchQuery.keyword ?? []).filter(
          (keyword) => keyword != removalKeyword
        ),
      })),
    [updateSearchQuery]
  );

  const onRelatedBookClick: (relatedBook: RelatedBook) => void = useCallback(
    (relatedBook) => {
      if (relatedBooks.some((book) => book.id === relatedBook.id)) {
        return;
      }
      updateSearchQuery((searchQuery) => ({
        ...searchQuery,
        book: [...(searchQuery.book ?? []), relatedBook.id],
      }));

      updateRelatedBooks((prevRelatedBooks) => [
        ...prevRelatedBooks,
        relatedBook,
      ]);
    },
    [relatedBooks, updateRelatedBooks, updateSearchQuery]
  );
  const onRelatedBookDelete: (relatedBook: RelatedBook) => void = useCallback(
    (relatedBook) => {
      updateSearchQuery((searchQuery) => ({
        ...searchQuery,
        book: (searchQuery.book ?? []).filter(
          (book) => book !== relatedBook.id
        ),
      }));
      updateRelatedBooks((prevRelatedBooks) =>
        prevRelatedBooks.filter((book) => book.id !== relatedBook.id)
      );
    },
    [updateRelatedBooks, updateSearchQuery]
  );
  useUnmount(() => updateRelatedBooks([]));

  return {
    query,
    searchQuery,
    input,
    target,
    relatedBooks,
    setType,
    setPage,
    onSearchInput,
    onSearchInputReset,
    onSearchSubmit,
    onSearchTargetChange,
    onAuthorFilterChange,
    onSharedFilterChange,
    onLicenseFilterChange,
    onSortChange,
    onLtiContextClick,
    onLtiContextDelete,
    onKeywordClick,
    onKeywordDelete,
    onRelatedBookClick,
    onRelatedBookDelete,
  };
}
