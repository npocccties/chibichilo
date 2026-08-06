import { pagesPath } from "$utils/$path";
import type { BookmarkSchema } from "$server/models/bookmark";
import type { NextRouter } from "next/router";

export const handleBookmarkClick = async (
  bookmark: BookmarkSchema,
  setOverrideLtiContext: (value: {
    ltiConsumerId?: string | null;
    ltiContextId?: string | null;
    pathname?: string | null;
  }) => void,
  push: NextRouter["push"],
  currentPathname: string
) => {
  const url = pagesPath.book.$url({
    query: {
      bookId: bookmark.bookId,
      topicId: bookmark.topicId,
    },
  });
  setOverrideLtiContext({
    ltiConsumerId: bookmark.ltiConsumerId ?? null,
    ltiContextId: bookmark.ltiContext.id,
    pathname: currentPathname,
  });
  return await push(url);
};
