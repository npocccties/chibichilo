import { pagesPath } from "$utils/$path";
import type { LtiContextState } from "$store/session";
import type { BookmarkSchema } from "$server/models/bookmark";
import type { NextRouter } from "next/router";

export const handleBookmarkClick = async (
  bookmark: BookmarkSchema,
  setLtiContext: (value: LtiContextState) => void,
  push: NextRouter["push"],
  currentPathname: string
) => {
  const url = pagesPath.book.$url({
    query: {
      bookId: bookmark.bookId,
      topicId: bookmark.topicId,
    },
  });

  setLtiContext({
    ltiConsumerId: bookmark.ltiConsumerId ?? null,
    ltiContextId: bookmark.ltiContext.id,
    pathname: currentPathname,
  });

  return await push(url);
};
