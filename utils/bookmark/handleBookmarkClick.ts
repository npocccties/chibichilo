import { bookUrl } from "$utils/routes";
import type { AppRouterPush } from "$utils/useAppRouter";
import type { BookmarkSchema } from "$server/models/bookmark";

export const handleBookmarkClick = async (
  bookmark: BookmarkSchema,
  setOverrideLtiContext: (value: {
    ltiConsumerId?: string | null;
    ltiContextId?: string | null;
    pathname?: string | null;
  }) => void,
  push: AppRouterPush,
  currentPathname: string
) => {
  const url = bookUrl({
    bookId: bookmark.bookId,
    topicId: bookmark.topicId,
  });
  setOverrideLtiContext({
    ltiConsumerId: bookmark.ltiConsumerId ?? null,
    ltiContextId: bookmark.ltiContext.id,
    pathname: currentPathname,
  });
  return await push({
    pathname: url.pathname,
    query: {
      ...url.query,
      lti_context_id: bookmark.ltiContext.id,
      ...(bookmark.ltiConsumerId
        ? { lti_consumer_id: bookmark.ltiConsumerId }
        : {}),
    },
  });
};
