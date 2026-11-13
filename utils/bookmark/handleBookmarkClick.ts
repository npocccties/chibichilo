import { paths } from "$utils/routes";
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
  setOverrideLtiContext({
    ltiConsumerId: bookmark.ltiConsumerId ?? null,
    ltiContextId: bookmark.ltiContext.id,
    pathname: currentPathname,
  });
  return await push({
    pathname: paths.book,
    query: {
      bookId: bookmark.bookId,
      topicId: bookmark.topicId,
      lti_context_id: bookmark.ltiContext.id,
      ...(bookmark.ltiConsumerId
        ? { lti_consumer_id: bookmark.ltiConsumerId }
        : {}),
    },
  });
};
