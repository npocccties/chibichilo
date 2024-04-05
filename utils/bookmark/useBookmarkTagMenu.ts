import { api } from "../api";
import useSWR from "swr";

import type { BookmarkTagMenu } from "$server/models/bookmark";

const key = "/api/v2/bookmarkTagMenu";

async function fetchBookmarkTagMenu() {
  const res = await api.apiV2BookmarkTagMenuGet();

  return res as unknown as {
    bookmarkTagMenu: BookmarkTagMenu;
  };
}

export function useBookmarkTagMenu() {
  const { data, isLoading } = useSWR({ key }, fetchBookmarkTagMenu);
  const bookmarkTagMenu: BookmarkTagMenu = data?.bookmarkTagMenu ?? [];
  return { bookmarkTagMenu, isLoading };
}
