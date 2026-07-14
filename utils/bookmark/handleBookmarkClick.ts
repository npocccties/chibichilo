import { bookUrl } from "$utils/routes";
import type { AppRouterPush } from "$utils/useAppRouter";
import type { LtiContextState } from "$store/session";
import type { BookmarkSchema } from "$server/models/bookmark";

export const handleBookmarkClick = async (
  bookmark: BookmarkSchema,
  setLtiContext: (value: LtiContextState) => void,
  push: AppRouterPush,
  currentPathname: string
) => {
  const url = bookUrl({
    bookId: bookmark.bookId,
    topicId: bookmark.topicId,
  });

  setLtiContext({
    ltiConsumerId: bookmark.ltiConsumerId ?? null,
    ltiContextId: bookmark.ltiContext.id,
    pathname: currentPathname,
  });

  return await push(url);
};
