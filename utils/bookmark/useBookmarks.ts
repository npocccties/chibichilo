import { api } from "../api";
import useSWR from "swr";

import type { BookmarkSchema, BookmarkTagMenu } from "$server/models/bookmark";
import type { BookmarkQuery } from "$server/validators/bookmarkQuery";
import { useLtiContextAtom } from "$store/session";

const key = "/api/v2/bookmark";

async function fetchBookmarks({
  ...query
}: BookmarkQuery & {
  key: typeof key;
}) {
  const res = await api.apiV2BookmarksGet(query);

  return res as unknown as {
    bookmark: BookmarkSchema[];
    bookmarkTagMenu: BookmarkTagMenu;
  };
}

function useBookmarks(query: BookmarkQuery) {
  const { ltiConsumerId, ltiContextId } = useLtiContextAtom();
  const mergedQuery = {
    ...query,
    ...(ltiConsumerId ? { ltiConsumerId } : {}),
    ...(ltiContextId ? { ltiContextId } : {}),
  };
  const { data, isLoading } = useSWR({ key, ...mergedQuery }, fetchBookmarks, {
    revalidateOnFocus: false,
  });
  const bookmarks: BookmarkSchema[] = data?.bookmark ?? [];
  const bookmarkTagMenu: BookmarkTagMenu = data?.bookmarkTagMenu ?? [];
  return { bookmarks, bookmarkTagMenu, isLoading };
}

export function useFilterBookmarks({
  tagIds,
  isExistMemoContent = false,
}: {
  tagIds: string;
  isExistMemoContent?: BookmarkQuery["isExistMemoContent"];
}) {
  return useBookmarks({ tagIds, isExistMemoContent, isAllUsers: false });
}

export function useBookmarksByTopicId({
  topicId,
  bookId,
  isAllUsers = false,
}: {
  topicId: number;
  bookId: number | undefined;
  isAllUsers?: BookmarkQuery["isAllUsers"];
}) {
  return useBookmarks({ topicId, bookId, isAllUsers });
}
