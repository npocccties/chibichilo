import { api } from "../api";
import useSWR from "swr";

import type { BookmarkSchema, BookmarkTagMenu } from "$server/models/bookmark";
import type { BookmarkQuery } from "$server/validators/bookmarkQuery";

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
  const { data, isLoading } = useSWR({ key, ...query }, fetchBookmarks);
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
  isAllUsers = false,
}: {
  topicId: number;
  isAllUsers?: BookmarkQuery["isAllUsers"];
}) {
  return useBookmarks({ topicId, isAllUsers });
}
